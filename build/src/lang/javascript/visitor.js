"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("../common/ast");
const comment_1 = require("../../utils/comment");
const sibling_1 = require("../../utils/sibling");
const _ = require("lodash");
const log_1 = require("../../utils/log");
const match_1 = require("../../utils/match");
const visitor_1 = require("../common/visitor");
/**
 * A class that visits ASTNodes from a TypeScript tree.
 */
class JavaScriptVisitor extends visitor_1.default {
    constructor(source, options) {
        super(options);
        this.ast = [];
        /* Visitors  */
        this.visitNode = (node, properties) => {
            switch (node.type) {
                case 'program':
                    this.ast = this.visitProgram(node);
                    break;
                case 'comment':
                    return this.visitComment(node);
                case 'MISSING':
                case 'ERROR':
                    this.logger.report(this.source, node, log_1.ErrorType.TreeSitterParseError);
                    break;
                default:
                    /* Match other non-terminals */
                    if (match_1.default(node, 'constraint', 'formal_parameters', 'required_parameter', 'rest_parameter', 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type', 'predefined_type', 'parenthesized_type', 'literal_type', 'intersection_type', 'union_type', 'class_body', 'extends_clause', 'unary_expression', 'binary_expression', 'parenthesized_expression', 'member_expression', 'statement_block', 'return_statement', 'export_statement', 'expression_statement', 
                    // A call_signature can also be a non-contextual node
                    'call_signature', 'internal_module', 'if_statement')) {
                        return this.visitNonTerminal(node, properties);
                    }
                    /* Match terminals */
                    if (match_1.default(node, 'identifier', 'extends', 'property_identifier', 'accessibility_modifier', 'null', 'undefined', 'return', 'get', 'function', 'namespace', 'if', 'const')) {
                        return this.visitTerminal(node);
                    }
                    this.logger.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    return;
            }
        };
        this.visitChildren = (nodes) => {
            let children = [];
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (!node.type.match(/[<>(){},:;\[\]&|=\+\-\*\/!.]/) && node.type !== '...') {
                    const child = this.visitNode(node);
                    if (child)
                        children.push(child);
                }
            }
            return children;
        };
        this.visitProgram = (node) => {
            let visited = {}, getStartLocation = (n) => `${n.location.row.start}:${n.location.column.start}`;
            // A program can have modules, namespaces, comments as its children
            // The first step is to parse all the comments in the root node
            let comments = this.visitChildren(this.filterType(node, 'comment'));
            // Parse the namespaces in expression_statement
            // let namespaces = this.visitChildren(this.filterType(node, 'expression_statement'));
            // Parse the export statements in the root node
            let exports = this.visitChildren(this.filterType(node, 'export_statement'));
            // Get the visited context nodes
            for (let i = 0; i < comments.length; i++) {
                const comment = comments[i];
                const context = comment;
                visited[getStartLocation(context)] = true;
            }
            // Exports are oddballs since some exports may reference
            // a type/node that may have been commented.
            // We'll first need to filter the ones we have visited
            _.remove(exports, x => visited[getStartLocation(x)]);
            // From the ones we have not visited, we'll need to modify
            // the node properties of each context in a comment node that
            // matches the ones we have not visited.
            const matched = {};
            comments = _.compact(comments.map(comment => {
                for (let i = 0; i < exports.length; i++) {
                    const export_ = exports[i];
                    const context = comment.context;
                    for (let j = 0; context && j < context.children.length; j++) {
                        if (context.children[i] && context.children[i].type === export_.type) {
                            matched[getStartLocation(export_)] = true;
                            comment.context.properties = Object.assign(comment.context.properties || {}, export_.properties);
                        }
                    }
                }
                return comment;
            }));
            // Removed the matched exports
            _.remove(exports, x => matched[getStartLocation(x)]);
            return [].concat(comments).concat(exports);
        };
        this.visitComment = (node) => {
            if (comment_1.isJavaDocComment(this.source, node)) {
                const nextSibling = sibling_1.sibling(node);
                if (nextSibling) {
                    return ast_1.createASTNode(this.source, node, this.visitContext(nextSibling, {}), true);
                }
            }
        };
        /**
         * Visit the contextual node
         *
         * # Remark
         *
         * A node is considered contextual when a comment is visited and the node is its sibling.
         */
        this.visitContext = (node, properties) => {
            switch (node.type) {
                case 'export_statement':
                    return this.visitExportStatement(node, properties);
                case 'expression_statement':
                    return this.visitExpressionStatement(node, properties);
                case 'class':
                    return this.visitClass(node, properties);
                case 'function':
                case 'call_signature':
                case 'method_signature':
                case 'property_signature':
                case 'public_field_definition':
                case 'method_definition':
                case 'lexical_declaration':
                    return this.visitNonTerminal(node, properties);
                default:
                    this.logger.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    return;
            }
        };
        /* Statements */
        this.visitExportStatement = (node, properties) => {
            let children = node.children, defaultExport = false;
            // Remove 'export' since it's always first in the array
            children.shift();
            if (this.hasDefaultExport(node)) {
                defaultExport = true;
                // Remove 'default' export
                children.shift();
            }
            const child = children.shift();
            return this.visitNode(child, { exports: { export: true, default: defaultExport } });
        };
        this.visitExpressionStatement = (node, properties) => {
            let children = node.children;
            const child = children.shift();
            if (match_1.default(child, 'internal_module')) {
                return this.visitInternalModule(child, properties);
            }
            if (match_1.default(child, 'function')) {
                if (properties)
                    return this.visitContext(child);
            }
            return this.visitNonTerminal(child);
        };
        /* Modules */
        this.visitInternalModule = (node, properties) => {
            let children = node.children.map(child => {
                if (match_1.default(child, 'statement_block')) {
                    return ast_1.createASTNode(this.source, node, this.visitChildren(this.filterType(child, 'comment')));
                }
                return this.visitNode(child);
            });
            return ast_1.createASTNode(this.source, node, children, Object.assign(properties || {}, { namespace: true }));
        };
        /* Declarations */
        this.visitClass = (node, properties) => {
            // Since 'interface' or 'class' is always first in the array
            // we'll need to remove it from the array.
            let children = node.children;
            const interface_ = children.shift();
            let extends_ = false, implements_ = false;
            if (this.hasInheritance(node)) {
                const inheritance = this.getInheritanceType(node);
                extends_ = inheritance === 'extends';
                implements_ = inheritance === 'implements';
            }
            const node_ = ast_1.createASTNode(this.source, node, this.visitChildren(children), Object.assign(properties || {}, {
                inheritance: {
                    implements: implements_,
                    extends: extends_
                }
            }));
            if (match_1.default(node, 'class')) {
                return node_;
            }
            // Overwrite the node type from 'interface_declaration' to 'interface'
            return Object.assign(node_, { type: interface_.type });
        };
        /* Non-terminals */
        this.visitNonTerminal = (node, properties) => {
            let children = node.children;
            // Handle special cases where some non-terminals
            // contain comments which is what we care about
            if (match_1.default(node, 'class_body', 'object_type')) {
                children = this.filterType(node, 'comment');
            }
            // Handle special cases where export statements have node properties
            if (match_1.default(node, 'export_statement')) {
                return this.visitExportStatement(node);
            }
            // Handle special cases where an internal module contains other nodes
            if (match_1.default(node, 'internal_module')) {
                return this.visitInternalModule(node, properties);
            }
            // Handle special cases where an intermal_module can exist in an expression_statement
            if (match_1.default(node, 'expression_statement')) {
                return this.visitExpressionStatement(node, properties);
            }
            // Handle special cases where a function has a statement_block
            if (match_1.default(node, 'function') || match_1.default(node, 'method_definition')) {
                _.remove(children, child => match_1.default(child, 'statement_block'));
                return ast_1.createASTNode(this.source, node, this.visitChildren(children), properties);
            }
            return ast_1.createASTNode(this.source, node, this.visitChildren(children), properties);
        };
        /* Terminals */
        this.visitTerminal = (node) => {
            return ast_1.createASTNode(this.source, node);
        };
        this.source = source;
    }
    /**
     * Determines whether a node has inheritance
     */
    hasInheritance(node) {
        let inherits = false;
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (match_1.default(child, 'extends', 'implements')) {
                inherits = true;
            }
        }
        return inherits;
    }
    /**
     * Returns a node's inheritance type
     */
    getInheritanceType(node) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (match_1.default(child, 'extends')) {
                return 'extends';
            }
            if (match_1.default(child, 'implements')) {
                return 'implements';
            }
        }
    }
    /**
     * Determines whether an export is default
     */
    hasDefaultExport(node) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (match_1.default(child, 'default')) {
                return true;
            }
        }
        return false;
    }
    /**
     * Returns only the comments from a node's children.
     */
    filterType(node, type) {
        let children = [];
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (match_1.default(child, type)) {
                children.push(child);
            }
        }
        return children;
    }
    getAST() {
        return this.ast;
    }
}
exports.JavaScriptVisitor = JavaScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2phdmFzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUE4QztBQUM5QyxpREFBdUQ7QUFDdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBRXRDLCtDQUE0RDtBQUk1RDs7R0FFRztBQUNILE1BQWEsaUJBQWtCLFNBQVEsaUJBQU87SUFHNUMsWUFBWSxNQUFjLEVBQUUsT0FBZ0M7UUFDMUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBSFQsUUFBRyxHQUFjLEVBQUUsQ0FBQTtRQW9FM0IsZUFBZTtRQUVmLGNBQVMsR0FBRyxDQUNWLElBQWdCLEVBQ2hCLFVBQTBDLEVBQzFDLEVBQUU7WUFDRixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLEtBQUssU0FBUztvQkFDWixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLE1BQU07Z0JBQ1IsS0FBSyxTQUFTO29CQUNaLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsS0FBSyxTQUFTLENBQUM7Z0JBQ2YsS0FBSyxPQUFPO29CQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUN0RSxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSwwQkFBMEIsRUFBRSxtQkFBbUIsRUFDeEYsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCO29CQUNqRixxREFBcUQ7b0JBQ3JELGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsY0FBYyxDQUNmLEVBQUU7d0JBQ0QsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO3FCQUMvQztvQkFFRCxxQkFBcUI7b0JBQ3JCLElBQUksZUFBSyxDQUFDLElBQUksRUFDWixZQUFZLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUN4RSxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFDN0IsS0FBSyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FDOUMsRUFBRTt3QkFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ2pDO29CQUVELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUN6RSxPQUFPO2FBQ1Y7UUFDSCxDQUFDLENBQUE7UUFFRCxrQkFBYSxHQUFHLENBQUMsS0FBbUIsRUFBYSxFQUFFO1lBQ2pELElBQUksUUFBUSxHQUFjLEVBQUUsQ0FBQztZQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsOEJBQThCLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtvQkFDM0UsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxLQUFLO3dCQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2pDO2FBQ0Y7WUFDRCxPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDLENBQUE7UUFFTyxpQkFBWSxHQUFHLENBQUMsSUFBZ0IsRUFBYSxFQUFFO1lBQ3JELElBQUksT0FBTyxHQUFHLEVBQUUsRUFDZCxnQkFBZ0IsR0FBRyxDQUFDLENBQVUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDMUYsbUVBQW1FO1lBQ25FLCtEQUErRDtZQUMvRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEUsK0NBQStDO1lBQy9DLHNGQUFzRjtZQUN0RiwrQ0FBK0M7WUFDL0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFNUUsZ0NBQWdDO1lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDeEIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQzNDO1lBRUQsd0RBQXdEO1lBQ3hELDRDQUE0QztZQUM1QyxzREFBc0Q7WUFDdEQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXJELDBEQUEwRDtZQUMxRCw2REFBNkQ7WUFDN0Qsd0NBQXdDO1lBQ3hDLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNuQixRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FDbEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3ZDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztvQkFDaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDM0QsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUU7NEJBQ3BFLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs0QkFDMUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FDeEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRSxFQUNoQyxPQUFPLENBQUMsVUFBVSxDQUNuQixDQUFDO3lCQUNIO3FCQUNGO2lCQUNGO2dCQUNELE9BQU8sT0FBTyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFTiw4QkFBOEI7WUFDOUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRXBELE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFBO1FBRU8saUJBQVksR0FBRyxDQUFDLElBQWdCLEVBQVcsRUFBRTtZQUNuRCxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sV0FBVyxHQUFHLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksV0FBVyxFQUFFO29CQUNmLE9BQU8sbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtpQkFDbEY7YUFDRjtRQUNILENBQUMsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNLLGlCQUFZLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFVBQTBDLEVBQVcsRUFBRTtZQUMvRixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLEtBQUssa0JBQWtCO29CQUNyQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3JELEtBQUssc0JBQXNCO29CQUN6QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3pELEtBQUssT0FBTztvQkFDVixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO2dCQUMxQyxLQUFLLFVBQVUsQ0FBQztnQkFDaEIsS0FBSyxnQkFBZ0IsQ0FBQztnQkFDdEIsS0FBSyxrQkFBa0IsQ0FBQztnQkFDeEIsS0FBSyxvQkFBb0IsQ0FBQztnQkFDMUIsS0FBSyx5QkFBeUIsQ0FBQztnQkFDL0IsS0FBSyxtQkFBbUIsQ0FBQztnQkFDekIsS0FBSyxxQkFBcUI7b0JBQ3hCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDakQ7b0JBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsZUFBUyxDQUFDLHVCQUF1QixDQUFDLENBQUM7b0JBQ3pFLE9BQU87YUFDVjtRQUNILENBQUMsQ0FBQTtRQUVELGdCQUFnQjtRQUVSLHlCQUFvQixHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUEwQyxFQUFXLEVBQUU7WUFDdkcsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLEdBQUcsS0FBSyxDQUFDO1lBQ3BELHVEQUF1RDtZQUN2RCxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9CLGFBQWEsR0FBRyxJQUFJLENBQUM7Z0JBQ3JCLDBCQUEwQjtnQkFDMUIsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2xCO1lBQ0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEYsQ0FBQyxDQUFBO1FBRU8sNkJBQXdCLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFVBQXlDLEVBQVcsRUFBRTtZQUMxRyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzdCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFBO2FBQ25EO1lBRUQsSUFBSSxlQUFLLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUFFO2dCQUM1QixJQUFJLFVBQVU7b0JBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDckMsQ0FBQyxDQUFBO1FBRUQsYUFBYTtRQUVMLHdCQUFtQixHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUEwQyxFQUFXLEVBQUU7WUFDdEcsSUFBSSxRQUFRLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xELElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO29CQUNuQyxPQUFPLG1CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQy9GO2dCQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRyxDQUFDLENBQUE7UUFHRCxrQkFBa0I7UUFFVixlQUFVLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFVBQTBDLEVBQVcsRUFBRTtZQUM3Riw0REFBNEQ7WUFDNUQsMENBQTBDO1lBQzFDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDN0IsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BDLElBQUksUUFBUSxHQUFHLEtBQUssRUFBRSxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQzFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDN0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNqRCxRQUFRLEdBQUcsV0FBVyxLQUFLLFNBQVMsQ0FBQztnQkFDckMsV0FBVyxHQUFHLFdBQVcsS0FBSyxZQUFZLENBQUM7YUFDNUM7WUFFRCxNQUFNLEtBQUssR0FBRyxtQkFBYSxDQUN6QixJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksRUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUM1QixNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQUU7Z0JBQzlCLFdBQVcsRUFBRTtvQkFDWCxVQUFVLEVBQUUsV0FBVztvQkFDdkIsT0FBTyxFQUFFLFFBQVE7aUJBQ087YUFDM0IsQ0FBQyxDQUFDLENBQUM7WUFFTixJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxzRUFBc0U7WUFDdEUsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUN4RCxDQUFDLENBQUE7UUFFRCxtQkFBbUI7UUFFWCxxQkFBZ0IsR0FBRyxDQUFDLElBQWdCLEVBQUUsVUFBMEMsRUFBVyxFQUFFO1lBQ25HLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDN0IsZ0RBQWdEO1lBQ2hELCtDQUErQztZQUMvQyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxFQUFFO2dCQUM1QyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDN0M7WUFDRCxvRUFBb0U7WUFDcEUsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEVBQUU7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hDO1lBRUQscUVBQXFFO1lBQ3JFLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNsQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDbkQ7WUFFRCxxRkFBcUY7WUFDckYsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzthQUN4RDtZQUVELDhEQUE4RDtZQUM5RCxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxFQUFFO2dCQUMvRCxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLGVBQUssQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFBO2dCQUM1RCxPQUFPLG1CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNuRjtZQUVELE9BQU8sbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3BGLENBQUMsQ0FBQTtRQUVELGVBQWU7UUFFUCxrQkFBYSxHQUFHLENBQUMsSUFBZ0IsRUFBVyxFQUFFO1lBQ3BELE9BQU8sbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ3pDLENBQUMsQ0FBQTtRQXpVQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQ7O09BRUc7SUFDSyxjQUFjLENBQUMsSUFBZ0I7UUFDckMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQ3pDLFFBQVEsR0FBRyxJQUFJLENBQUM7YUFDakI7U0FDRjtRQUNELE9BQU8sUUFBUSxDQUFBO0lBQ2pCLENBQUM7SUFFRDs7T0FFRztJQUNLLGtCQUFrQixDQUFDLElBQWdCO1FBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCxJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sWUFBWSxDQUFDO2FBQ3JCO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxnQkFBZ0IsQ0FBQyxJQUFnQjtRQUN2QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0ssVUFBVSxDQUFDLElBQWdCLEVBQUUsSUFBWTtRQUMvQyxJQUFJLFFBQVEsR0FBaUIsRUFBRSxDQUFDO1FBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN0QjtTQUNGO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsQ0FBQztDQTRRRjtBQS9VRCw4Q0ErVUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVBU1ROb2RlIH0gZnJvbSBcIi4uL2NvbW1vbi9hc3RcIjtcbmltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29tbWVudFwiO1xuaW1wb3J0IHsgc2libGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zaWJsaW5nXCI7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi91dGlscy9sb2dcIjtcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vdXRpbHMvbWF0Y2hcIjtcbmltcG9ydCBTb3VyY2UgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvU291cmNlXCI7XG5pbXBvcnQgVmlzaXRvciwgeyBWaXNpdG9yT3B0aW9ucyB9IGZyb20gXCIuLi9jb21tb24vdmlzaXRvclwiO1xuaW1wb3J0IEFTVE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvQVNUTm9kZVwiO1xuaW1wb3J0IHsgSmF2YVNjcmlwdFByb3BlcnRpZXMsIEphdmFTY3JpcHRJbmhlcml0YW5jZSB9IGZyb20gXCIuL3Byb3BlcnRpZXNcIjtcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgdmlzaXRzIEFTVE5vZGVzIGZyb20gYSBUeXBlU2NyaXB0IHRyZWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBKYXZhU2NyaXB0VmlzaXRvciBleHRlbmRzIFZpc2l0b3Ige1xuICBwcml2YXRlIGFzdDogQVNUTm9kZVtdID0gW11cbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZVxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSwgb3B0aW9uczogUGFydGlhbDxWaXNpdG9yT3B0aW9ucz4pIHtcbiAgICBzdXBlcihvcHRpb25zKTtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBub2RlIGhhcyBpbmhlcml0YW5jZVxuICAgKi9cbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XG4gICAgbGV0IGluaGVyaXRzID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdleHRlbmRzJywgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICBpbmhlcml0cyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmhlcml0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbmhlcml0YW5jZVR5cGUobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycpKSB7XG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICByZXR1cm4gJ2ltcGxlbWVudHMnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZXhwb3J0IGlzIGRlZmF1bHRcbiAgICovXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9ubHkgdGhlIGNvbW1lbnRzIGZyb20gYSBub2RlJ3MgY2hpbGRyZW4uXG4gICAqL1xuICBwcml2YXRlIGZpbHRlclR5cGUobm9kZTogU3ludGF4Tm9kZSwgdHlwZTogc3RyaW5nKTogU3ludGF4Tm9kZVtdIHtcbiAgICBsZXQgY2hpbGRyZW46IFN5bnRheE5vZGVbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCB0eXBlKSkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG5cbiAgZ2V0QVNUKCk6IEFTVE5vZGVbXSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0O1xuICB9XG5cbiAgLyogVmlzaXRvcnMgICovXG5cbiAgdmlzaXROb2RlID0gKFxuICAgIG5vZGU6IFN5bnRheE5vZGUsXG4gICAgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+XG4gICkgPT4ge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdwcm9ncmFtJzpcbiAgICAgICAgdGhpcy5hc3QgPSB0aGlzLnZpc2l0UHJvZ3JhbShub2RlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDb21tZW50KG5vZGUpO1xuICAgICAgY2FzZSAnTUlTU0lORyc6XG4gICAgICBjYXNlICdFUlJPUic6XG4gICAgICAgIHRoaXMubG9nZ2VyLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuXG4gICAgICAgIC8qIE1hdGNoIG90aGVyIG5vbi10ZXJtaW5hbHMgKi9cblxuICAgICAgICBpZiAobWF0Y2gobm9kZSxcbiAgICAgICAgICAnY29uc3RyYWludCcsXG4gICAgICAgICAgJ2Zvcm1hbF9wYXJhbWV0ZXJzJywgJ3JlcXVpcmVkX3BhcmFtZXRlcicsICdyZXN0X3BhcmFtZXRlcicsXG4gICAgICAgICAgJ3R5cGVfaWRlbnRpZmllcicsICd0eXBlX3BhcmFtZXRlcnMnLCAndHlwZV9wYXJhbWV0ZXInLCAndHlwZV9hbm5vdGF0aW9uJyxcbiAgICAgICAgICAnb2JqZWN0X3R5cGUnLCAncHJlZGVmaW5lZF90eXBlJywgJ3BhcmVudGhlc2l6ZWRfdHlwZScsICdsaXRlcmFsX3R5cGUnLFxuICAgICAgICAgICdpbnRlcnNlY3Rpb25fdHlwZScsICd1bmlvbl90eXBlJyxcbiAgICAgICAgICAnY2xhc3NfYm9keScsXG4gICAgICAgICAgJ2V4dGVuZHNfY2xhdXNlJyxcbiAgICAgICAgICAndW5hcnlfZXhwcmVzc2lvbicsICdiaW5hcnlfZXhwcmVzc2lvbicsICdwYXJlbnRoZXNpemVkX2V4cHJlc3Npb24nLCAnbWVtYmVyX2V4cHJlc3Npb24nLFxuICAgICAgICAgICdzdGF0ZW1lbnRfYmxvY2snLCAncmV0dXJuX3N0YXRlbWVudCcsICdleHBvcnRfc3RhdGVtZW50JywgJ2V4cHJlc3Npb25fc3RhdGVtZW50JyxcbiAgICAgICAgICAvLyBBIGNhbGxfc2lnbmF0dXJlIGNhbiBhbHNvIGJlIGEgbm9uLWNvbnRleHR1YWwgbm9kZVxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXG4gICAgICAgICAgJ2ludGVybmFsX21vZHVsZScsXG4gICAgICAgICAgJ2lmX3N0YXRlbWVudCdcbiAgICAgICAgKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSwgcHJvcGVydGllcylcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE1hdGNoIHRlcm1pbmFscyAqL1xuICAgICAgICBpZiAobWF0Y2gobm9kZSxcbiAgICAgICAgICAnaWRlbnRpZmllcicsICdleHRlbmRzJywgJ3Byb3BlcnR5X2lkZW50aWZpZXInLCAnYWNjZXNzaWJpbGl0eV9tb2RpZmllcicsXG4gICAgICAgICAgJ251bGwnLCAndW5kZWZpbmVkJywgJ3JldHVybicsXG4gICAgICAgICAgJ2dldCcsICdmdW5jdGlvbicsICduYW1lc3BhY2UnLCAnaWYnLCAnY29uc3QnXG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFRlcm1pbmFsKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2dnZXIucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdmlzaXRDaGlsZHJlbiA9IChub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdID0+IHtcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgIGlmICghbm9kZS50eXBlLm1hdGNoKC9bPD4oKXt9LDo7XFxbXFxdJnw9XFwrXFwtXFwqXFwvIS5dLykgJiYgbm9kZS50eXBlICE9PSAnLi4uJykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMudmlzaXROb2RlKG5vZGUpO1xuICAgICAgICBpZiAoY2hpbGQpIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICBwcml2YXRlIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcbiAgICBsZXQgdmlzaXRlZCA9IHt9LFxuICAgICAgZ2V0U3RhcnRMb2NhdGlvbiA9IChuOiBBU1ROb2RlKSA9PiBgJHtuLmxvY2F0aW9uLnJvdy5zdGFydH06JHtuLmxvY2F0aW9uLmNvbHVtbi5zdGFydH1gO1xuICAgIC8vIEEgcHJvZ3JhbSBjYW4gaGF2ZSBtb2R1bGVzLCBuYW1lc3BhY2VzLCBjb21tZW50cyBhcyBpdHMgY2hpbGRyZW5cbiAgICAvLyBUaGUgZmlyc3Qgc3RlcCBpcyB0byBwYXJzZSBhbGwgdGhlIGNvbW1lbnRzIGluIHRoZSByb290IG5vZGVcbiAgICBsZXQgY29tbWVudHMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50JykpO1xuICAgIC8vIFBhcnNlIHRoZSBuYW1lc3BhY2VzIGluIGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgLy8gbGV0IG5hbWVzcGFjZXMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKTtcbiAgICAvLyBQYXJzZSB0aGUgZXhwb3J0IHN0YXRlbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxuICAgIGxldCBleHBvcnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKTtcblxuICAgIC8vIEdldCB0aGUgdmlzaXRlZCBjb250ZXh0IG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29tbWVudCA9IGNvbW1lbnRzW2ldO1xuICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQ7XG4gICAgICB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oY29udGV4dCldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnRzIGFyZSBvZGRiYWxscyBzaW5jZSBzb21lIGV4cG9ydHMgbWF5IHJlZmVyZW5jZVxuICAgIC8vIGEgdHlwZS9ub2RlIHRoYXQgbWF5IGhhdmUgYmVlbiBjb21tZW50ZWQuXG4gICAgLy8gV2UnbGwgZmlyc3QgbmVlZCB0byBmaWx0ZXIgdGhlIG9uZXMgd2UgaGF2ZSB2aXNpdGVkXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcblxuICAgIC8vIEZyb20gdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZCwgd2UnbGwgbmVlZCB0byBtb2RpZnlcbiAgICAvLyB0aGUgbm9kZSBwcm9wZXJ0aWVzIG9mIGVhY2ggY29udGV4dCBpbiBhIGNvbW1lbnQgbm9kZSB0aGF0XG4gICAgLy8gbWF0Y2hlcyB0aGUgb25lcyB3ZSBoYXZlIG5vdCB2aXNpdGVkLlxuICAgIGNvbnN0IG1hdGNoZWQgPSB7fTtcbiAgICBjb21tZW50cyA9IF8uY29tcGFjdChcbiAgICAgIGNvbW1lbnRzLm1hcChjb21tZW50ID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBvcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZXhwb3J0XyA9IGV4cG9ydHNbaV07XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQuY29udGV4dDtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgY29udGV4dCAmJiBqIDwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuY2hpbGRyZW5baV0gJiYgY29udGV4dC5jaGlsZHJlbltpXS50eXBlID09PSBleHBvcnRfLnR5cGUpIHtcbiAgICAgICAgICAgICAgbWF0Y2hlZFtnZXRTdGFydExvY2F0aW9uKGV4cG9ydF8pXSA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyB8fCB7fSxcbiAgICAgICAgICAgICAgICBleHBvcnRfLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1lbnQ7XG4gICAgICB9KSk7XG5cbiAgICAvLyBSZW1vdmVkIHRoZSBtYXRjaGVkIGV4cG9ydHNcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pXG5cbiAgICByZXR1cm4gW10uY29uY2F0KGNvbW1lbnRzKS5jb25jYXQoZXhwb3J0cyk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XG4gICAgaWYgKGlzSmF2YURvY0NvbW1lbnQodGhpcy5zb3VyY2UsIG5vZGUpKSB7XG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IHNpYmxpbmcobm9kZSk7XG4gICAgICBpZiAobmV4dFNpYmxpbmcpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDb250ZXh0KG5leHRTaWJsaW5nLCB7fSksIHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZpc2l0IHRoZSBjb250ZXh0dWFsIG5vZGVcbiAgICogXG4gICAqICMgUmVtYXJrXG4gICAqIFxuICAgKiBBIG5vZGUgaXMgY29uc2lkZXJlZCBjb250ZXh0dWFsIHdoZW4gYSBjb21tZW50IGlzIHZpc2l0ZWQgYW5kIHRoZSBub2RlIGlzIGl0cyBzaWJsaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdENvbnRleHQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2V4cG9ydF9zdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGNhc2UgJ2V4cHJlc3Npb25fc3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgICAgY2FzZSAnY2xhc3MnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENsYXNzKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICBjYXNlICdjYWxsX3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdtZXRob2Rfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ3Byb3BlcnR5X3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdwdWJsaWNfZmllbGRfZGVmaW5pdGlvbic6XG4gICAgICBjYXNlICdtZXRob2RfZGVmaW5pdGlvbic6XG4gICAgICBjYXNlICdsZXhpY2FsX2RlY2xhcmF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMubG9nZ2VyLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIC8qIFN0YXRlbWVudHMgKi9cblxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sIGRlZmF1bHRFeHBvcnQgPSBmYWxzZTtcbiAgICAvLyBSZW1vdmUgJ2V4cG9ydCcgc2luY2UgaXQncyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBpZiAodGhpcy5oYXNEZWZhdWx0RXhwb3J0KG5vZGUpKSB7XG4gICAgICBkZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XG4gICAgICBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkLCB7IGV4cG9ydHM6IHsgZXhwb3J0OiB0cnVlLCBkZWZhdWx0OiBkZWZhdWx0RXhwb3J0IH0gfSk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0RXhwcmVzc2lvblN0YXRlbWVudCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzOiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xuXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUoY2hpbGQsIHByb3BlcnRpZXMpXG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnZnVuY3Rpb24nKSkge1xuICAgICAgaWYgKHByb3BlcnRpZXMpIHJldHVybiB0aGlzLnZpc2l0Q29udGV4dChjaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChjaGlsZClcbiAgfVxuXG4gIC8qIE1vZHVsZXMgKi9cblxuICBwcml2YXRlIHZpc2l0SW50ZXJuYWxNb2R1bGUgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShjaGlsZCwgJ2NvbW1lbnQnKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQpO1xuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCBjaGlsZHJlbiwgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7IG5hbWVzcGFjZTogdHJ1ZSB9KSk7XG4gIH1cblxuXG4gIC8qIERlY2xhcmF0aW9ucyAqL1xuXG4gIHByaXZhdGUgdmlzaXRDbGFzcyA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxKYXZhU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICAvLyBTaW5jZSAnaW50ZXJmYWNlJyBvciAnY2xhc3MnIGlzIGFsd2F5cyBmaXJzdCBpbiB0aGUgYXJyYXlcbiAgICAvLyB3ZSdsbCBuZWVkIHRvIHJlbW92ZSBpdCBmcm9tIHRoZSBhcnJheS5cbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIGNvbnN0IGludGVyZmFjZV8gPSBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIGxldCBleHRlbmRzXyA9IGZhbHNlLCBpbXBsZW1lbnRzXyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmhhc0luaGVyaXRhbmNlKG5vZGUpKSB7XG4gICAgICBjb25zdCBpbmhlcml0YW5jZSA9IHRoaXMuZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGUpXG4gICAgICBleHRlbmRzXyA9IGluaGVyaXRhbmNlID09PSAnZXh0ZW5kcyc7XG4gICAgICBpbXBsZW1lbnRzXyA9IGluaGVyaXRhbmNlID09PSAnaW1wbGVtZW50cyc7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZV8gPSBjcmVhdGVBU1ROb2RlKFxuICAgICAgdGhpcy5zb3VyY2UsXG4gICAgICBub2RlLFxuICAgICAgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSxcbiAgICAgIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcyB8fCB7fSwge1xuICAgICAgICBpbmhlcml0YW5jZToge1xuICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNfLFxuICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNfXG4gICAgICAgIH0gYXMgSmF2YVNjcmlwdEluaGVyaXRhbmNlXG4gICAgICB9KSk7XG5cbiAgICBpZiAobWF0Y2gobm9kZSwgJ2NsYXNzJykpIHtcbiAgICAgIHJldHVybiBub2RlXztcbiAgICB9XG4gICAgLy8gT3ZlcndyaXRlIHRoZSBub2RlIHR5cGUgZnJvbSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJyB0byAnaW50ZXJmYWNlJ1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5vZGVfLCB7IHR5cGU6IGludGVyZmFjZV8udHlwZSB9KVxuICB9XG5cbiAgLyogTm9uLXRlcm1pbmFscyAqL1xuXG4gIHByaXZhdGUgdmlzaXROb25UZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxKYXZhU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIHNvbWUgbm9uLXRlcm1pbmFsc1xuICAgIC8vIGNvbnRhaW4gY29tbWVudHMgd2hpY2ggaXMgd2hhdCB3ZSBjYXJlIGFib3V0XG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzc19ib2R5JywgJ29iamVjdF90eXBlJykpIHtcbiAgICAgIGNoaWxkcmVuID0gdGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50Jyk7XG4gICAgfVxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGV4cG9ydCBzdGF0ZW1lbnRzIGhhdmUgbm9kZSBwcm9wZXJ0aWVzXG4gICAgaWYgKG1hdGNoKG5vZGUsICdleHBvcnRfc3RhdGVtZW50JykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybmFsIG1vZHVsZSBjb250YWlucyBvdGhlciBub2Rlc1xuICAgIGlmIChtYXRjaChub2RlLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUobm9kZSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYW4gaW50ZXJtYWxfbW9kdWxlIGNhbiBleGlzdCBpbiBhbiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgIGlmIChtYXRjaChub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGEgZnVuY3Rpb24gaGFzIGEgc3RhdGVtZW50X2Jsb2NrXG4gICAgaWYgKG1hdGNoKG5vZGUsICdmdW5jdGlvbicpIHx8IG1hdGNoKG5vZGUsICdtZXRob2RfZGVmaW5pdGlvbicpKSB7XG4gICAgICBfLnJlbW92ZShjaGlsZHJlbiwgY2hpbGQgPT4gbWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSlcbiAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XG4gIH1cblxuICAvKiBUZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0VGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxuICB9XG59Il19