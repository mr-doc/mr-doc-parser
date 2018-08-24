"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../utils/comment");
const sibling_1 = require("../../utils/sibling");
const _ = require("lodash");
const log_1 = require("../../utils/log");
const match_1 = require("../../utils/match");
const visitor_1 = require("../common/visitor");
const ast_1 = require("../common/ast");
/**
 * A class that visits ASTNodes from a TypeScript tree.
 */
class TypeScriptVisitor extends visitor_1.default {
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
                    if (match_1.default(node, 'constraint', 'formal_parameters', 'required_parameter', 'rest_parameter', 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type', 'predefined_type', 'parenthesized_type', 'literal_type', 'intersection_type', 'union_type', 'class_body', 'extends_clause', 'unary_expression', 'binary_expression', 'member_expression', 'statement_block', 'return_statement', 'export_statement', 'expression_statement', 
                    // A call_signature can also be a non-contextual node
                    'call_signature', 'internal_module', 'variable_declarator', 'object')) {
                        return this.visitNonTerminal(node, properties);
                    }
                    /* Match terminals */
                    if (match_1.default(node, 'identifier', 'extends', 'property_identifier', 'accessibility_modifier', 'string', 'void', 'boolean', 'null', 'undefined', 'number', 'return', 'get', 'function', 'namespace', 'const')) {
                        return this.visitTerminal(node);
                    }
                    this.logger.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        this.visitChildren = (nodes) => {
            let children = [];
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (!node.type.match(/[<>(){},:;\[\]&|=\+\-\*\/]/) && node.type !== '...') {
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
            let namespaces = this.visitChildren(this.filterType(node, 'expression_statement'));
            // Parse the export statements in the root node
            let exports = this.visitChildren(this.filterType(node, 'export_statement'));
            // Get the visited context nodes
            for (let i = 0; i < comments.length; i++) {
                const comment = comments[i];
                const context = comment;
                visited[getStartLocation(context)] = true;
            }
            // Remove the visited nodes from namespaces array
            _.remove(namespaces, x => visited[getStartLocation(x)]);
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
            return [].concat(comments).concat(namespaces).concat(exports);
        };
        this.visitComment = (node) => {
            if (comment_1.isJavaDocComment(this.source, node) && !comment_1.isLegalComment(this.source, node)) {
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
                case 'interface_declaration':
                    return this.visitClassOrInterface(node, properties);
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
                    break;
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
                    return this.visitContext(child, properties);
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
        this.visitClassOrInterface = (node, properties) => {
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
exports.TypeScriptVisitor = TypeScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUF1RTtBQUN2RSxpREFBOEM7QUFFOUMsNEJBQTRCO0FBQzVCLHlDQUFpRDtBQUNqRCw2Q0FBc0M7QUFFdEMsK0NBQTREO0FBRTVELHVDQUE4QztBQUc5Qzs7R0FFRztBQUNILE1BQWEsaUJBQWtCLFNBQVEsaUJBQU87SUFHNUMsWUFBWSxNQUFjLEVBQUUsT0FBZ0M7UUFDMUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBSFIsUUFBRyxHQUFjLEVBQUUsQ0FBQTtRQW9FM0IsZUFBZTtRQUVmLGNBQVMsR0FBRyxDQUNWLElBQWdCLEVBQ2hCLFVBQTBDLEVBQzFDLEVBQUU7WUFDRixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLEtBQUssU0FBUztvQkFDWixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLE1BQU07Z0JBQ1IsS0FBSyxTQUFTO29CQUNaLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsS0FBSyxTQUFTLENBQUM7Z0JBQ2YsS0FBSyxPQUFPO29CQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUN0RSxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsRUFDNUQsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCO29CQUNqRixxREFBcUQ7b0JBQ3JELGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIscUJBQXFCLEVBQ3JCLFFBQVEsQ0FDVCxFQUFFO3dCQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTtxQkFDL0M7b0JBRUQscUJBQXFCO29CQUNyQixJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQ1osWUFBWSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSx3QkFBd0IsRUFDeEUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUNwRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQ3hDLEVBQUU7d0JBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNqQztvQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDekUsTUFBTTthQUNUO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsa0JBQWEsR0FBRyxDQUFDLEtBQW1CLEVBQWEsRUFBRTtZQUNqRCxJQUFJLFFBQVEsR0FBYyxFQUFFLENBQUM7WUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3JDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7b0JBQ3pFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLElBQUksS0FBSzt3QkFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNqQzthQUNGO1lBQ0QsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQyxDQUFBO1FBRU8saUJBQVksR0FBRyxDQUFDLElBQWdCLEVBQWEsRUFBRTtZQUNyRCxJQUFJLE9BQU8sR0FBRyxFQUFFLEVBQ2QsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFVLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzFGLG1FQUFtRTtZQUNuRSwrREFBK0Q7WUFDL0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLCtDQUErQztZQUMvQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUNuRiwrQ0FBK0M7WUFDL0MsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFNUUsZ0NBQWdDO1lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDeEIsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQzNDO1lBRUQsaURBQWlEO1lBQ2pELENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RCx3REFBd0Q7WUFDeEQsNENBQTRDO1lBQzVDLHNEQUFzRDtZQUN0RCxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckQsMERBQTBEO1lBQzFELDZEQUE2RDtZQUM3RCx3Q0FBd0M7WUFDeEMsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ25CLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUNsQixRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDdkMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO29CQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMzRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLElBQUksRUFBRTs0QkFDcEUsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOzRCQUMxQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUN4QyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQ2hDLE9BQU8sQ0FBQyxVQUFVLENBQ25CLENBQUM7eUJBQ0g7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsT0FBTyxPQUFPLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVOLDhCQUE4QjtZQUM5QixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFcEQsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEUsQ0FBQyxDQUFBO1FBRU8saUJBQVksR0FBRyxDQUFDLElBQWdCLEVBQVcsRUFBRTtZQUNuRCxJQUFJLDBCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQzdFLE1BQU0sV0FBVyxHQUFHLGlCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksV0FBVyxFQUFFO29CQUNmLE9BQU8sbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtpQkFDbEY7YUFDRjtRQUNILENBQUMsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNLLGlCQUFZLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFVBQTBDLEVBQVcsRUFBRTtZQUMvRixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLEtBQUssa0JBQWtCO29CQUNyQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3JELEtBQUssc0JBQXNCO29CQUN6QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3pELEtBQUssT0FBTyxDQUFDO2dCQUNiLEtBQUssdUJBQXVCO29CQUMxQixPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUE7Z0JBQ3JELEtBQUssVUFBVSxDQUFDO2dCQUNoQixLQUFLLGdCQUFnQixDQUFDO2dCQUN0QixLQUFLLGtCQUFrQixDQUFDO2dCQUN4QixLQUFLLG9CQUFvQixDQUFDO2dCQUMxQixLQUFLLHlCQUF5QixDQUFDO2dCQUMvQixLQUFLLG1CQUFtQixDQUFDO2dCQUN6QixLQUFLLHFCQUFxQjtvQkFDeEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNqRDtvQkFDRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDekUsTUFBTTthQUNUO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsZ0JBQWdCO1FBRVIseUJBQW9CLEdBQUcsQ0FBQyxJQUFnQixFQUFFLFVBQTBDLEVBQVcsRUFBRTtZQUN2RyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDcEQsdURBQXVEO1lBQ3ZELFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0IsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDckIsMEJBQTBCO2dCQUMxQixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDbEI7WUFDRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDL0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RixDQUFDLENBQUE7UUFFTyw2QkFBd0IsR0FBRyxDQUFDLElBQWdCLEVBQUUsVUFBeUMsRUFBVyxFQUFFO1lBQzFHLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDN0IsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRS9CLElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUE7YUFDbkQ7WUFFRCxJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQUU7Z0JBQzVCLElBQUksVUFBVTtvQkFBRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDckMsQ0FBQyxDQUFBO1FBRUQsYUFBYTtRQUVMLHdCQUFtQixHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUEwQyxFQUFXLEVBQUU7WUFDdEcsSUFBSSxRQUFRLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xELElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxFQUFFO29CQUNuQyxPQUFPLG1CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQy9GO2dCQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRyxDQUFDLENBQUE7UUFHRCxrQkFBa0I7UUFFViwwQkFBcUIsR0FBRyxDQUFDLElBQWdCLEVBQUUsVUFBMEMsRUFBVyxFQUFFO1lBQ3hHLDREQUE0RDtZQUM1RCwwQ0FBMEM7WUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEMsSUFBSSxRQUFRLEdBQUcsS0FBSyxFQUFFLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDMUMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2pELFFBQVEsR0FBRyxXQUFXLEtBQUssU0FBUyxDQUFDO2dCQUNyQyxXQUFXLEdBQUcsV0FBVyxLQUFLLFlBQVksQ0FBQzthQUM1QztZQUVELE1BQU0sS0FBSyxHQUFHLG1CQUFhLENBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxFQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQzVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRTtnQkFDOUIsV0FBVyxFQUFFO29CQUNYLFVBQVUsRUFBRSxXQUFXO29CQUN2QixPQUFPLEVBQUUsUUFBUTtpQkFDTzthQUMzQixDQUFDLENBQUMsQ0FBQztZQUVOLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDeEIsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELHNFQUFzRTtZQUN0RSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ3hELENBQUMsQ0FBQTtRQUVELG1CQUFtQjtRQUVYLHFCQUFnQixHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUEwQyxFQUFXLEVBQUU7WUFDbkcsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QixnREFBZ0Q7WUFDaEQsK0NBQStDO1lBQy9DLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUU7Z0JBQzVDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzthQUM3QztZQUNELG9FQUFvRTtZQUNwRSxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEM7WUFFRCxxRUFBcUU7WUFDckUsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNuRDtZQUVELHFGQUFxRjtZQUNyRixJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsRUFBRTtnQkFDdkMsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3hEO1lBRUQsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDL0QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxlQUFLLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtnQkFDNUQsT0FBTyxtQkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDbkY7WUFFRCxPQUFPLG1CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUE7UUFFRCxlQUFlO1FBRVAsa0JBQWEsR0FBRyxDQUFDLElBQWdCLEVBQVcsRUFBRTtZQUNwRCxPQUFPLG1CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUN6QyxDQUFDLENBQUE7UUE1VUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssY0FBYyxDQUFDLElBQWdCO1FBQ3JDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUN6QyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ2pCO1NBQ0Y7UUFDRCxPQUFPLFFBQVEsQ0FBQTtJQUNqQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxrQkFBa0IsQ0FBQyxJQUFnQjtRQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBRUQsSUFBSSxlQUFLLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUM5QixPQUFPLFlBQVksQ0FBQzthQUNyQjtTQUNGO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0ssZ0JBQWdCLENBQUMsSUFBZ0I7UUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxlQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUMzQixPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNLLFVBQVUsQ0FBQyxJQUFnQixFQUFFLElBQVk7UUFDL0MsSUFBSSxRQUFRLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0ErUUY7QUFsVkQsOENBa1ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNKYXZhRG9jQ29tbWVudCwgaXNMZWdhbENvbW1lbnQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29tbWVudFwiO1xuaW1wb3J0IHsgc2libGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zaWJsaW5nXCI7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi91dGlscy9sb2dcIjtcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vdXRpbHMvbWF0Y2hcIjtcbmltcG9ydCBTb3VyY2UgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvU291cmNlXCI7XG5pbXBvcnQgVmlzaXRvciwgeyBWaXNpdG9yT3B0aW9ucyB9IGZyb20gXCIuLi9jb21tb24vdmlzaXRvclwiO1xuaW1wb3J0IEFTVE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvQVNUTm9kZVwiO1xuaW1wb3J0IHsgY3JlYXRlQVNUTm9kZSB9IGZyb20gXCIuLi9jb21tb24vYXN0XCI7XG5pbXBvcnQgeyBUeXBlU2NyaXB0UHJvcGVydGllcywgVHlwZVNjcmlwdEluaGVyaXRhbmNlIH0gZnJvbSBcIi4vcHJvcGVydGllc1wiO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCB2aXNpdHMgQVNUTm9kZXMgZnJvbSBhIFR5cGVTY3JpcHQgdHJlZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRWaXNpdG9yIGV4dGVuZHMgVmlzaXRvciB7XG4gIHByaXZhdGUgYXN0OiBBU1ROb2RlW10gPSBbXVxuICBwcml2YXRlIHNvdXJjZTogU291cmNlXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlLCBvcHRpb25zOiBQYXJ0aWFsPFZpc2l0b3JPcHRpb25zPikge1xuICAgIHN1cGVyKG9wdGlvbnMpXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgbm9kZSBoYXMgaW5oZXJpdGFuY2VcbiAgICovXG4gIHByaXZhdGUgaGFzSW5oZXJpdGFuY2Uobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGxldCBpbmhlcml0cyA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycsICdpbXBsZW1lbnRzJykpIHtcbiAgICAgICAgaW5oZXJpdHMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5oZXJpdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbm9kZSdzIGluaGVyaXRhbmNlIHR5cGVcbiAgICovXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnKSkge1xuICAgICAgICByZXR1cm4gJ2V4dGVuZHMnO1xuICAgICAgfVxuXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdpbXBsZW1lbnRzJykpIHtcbiAgICAgICAgcmV0dXJuICdpbXBsZW1lbnRzJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGV4cG9ydCBpcyBkZWZhdWx0XG4gICAqL1xuICBwcml2YXRlIGhhc0RlZmF1bHRFeHBvcnQobm9kZTogU3ludGF4Tm9kZSk6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZGVmYXVsdCcpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBvbmx5IHRoZSBjb21tZW50cyBmcm9tIGEgbm9kZSdzIGNoaWxkcmVuLlxuICAgKi9cbiAgcHJpdmF0ZSBmaWx0ZXJUeXBlKG5vZGU6IFN5bnRheE5vZGUsIHR5cGU6IHN0cmluZyk6IFN5bnRheE5vZGVbXSB7XG4gICAgbGV0IGNoaWxkcmVuOiBTeW50YXhOb2RlW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgdHlwZSkpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIGdldEFTVCgpOiBBU1ROb2RlW10ge1xuICAgIHJldHVybiB0aGlzLmFzdDtcbiAgfVxuXG4gIC8qIFZpc2l0b3JzICAqL1xuXG4gIHZpc2l0Tm9kZSA9IChcbiAgICBub2RlOiBTeW50YXhOb2RlLFxuICAgIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPlxuICApID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAncHJvZ3JhbSc6XG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxuICAgICAgY2FzZSAnRVJST1InOlxuICAgICAgICB0aGlzLmxvZ2dlci5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5UcmVlU2l0dGVyUGFyc2VFcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcblxuICAgICAgICAvKiBNYXRjaCBvdGhlciBub24tdGVybWluYWxzICovXG5cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXG4gICAgICAgICAgJ2NvbnN0cmFpbnQnLFxuICAgICAgICAgICdmb3JtYWxfcGFyYW1ldGVycycsICdyZXF1aXJlZF9wYXJhbWV0ZXInLCAncmVzdF9wYXJhbWV0ZXInLFxuICAgICAgICAgICd0eXBlX2lkZW50aWZpZXInLCAndHlwZV9wYXJhbWV0ZXJzJywgJ3R5cGVfcGFyYW1ldGVyJywgJ3R5cGVfYW5ub3RhdGlvbicsXG4gICAgICAgICAgJ29iamVjdF90eXBlJywgJ3ByZWRlZmluZWRfdHlwZScsICdwYXJlbnRoZXNpemVkX3R5cGUnLCAnbGl0ZXJhbF90eXBlJyxcbiAgICAgICAgICAnaW50ZXJzZWN0aW9uX3R5cGUnLCAndW5pb25fdHlwZScsXG4gICAgICAgICAgJ2NsYXNzX2JvZHknLFxuICAgICAgICAgICdleHRlbmRzX2NsYXVzZScsXG4gICAgICAgICAgJ3VuYXJ5X2V4cHJlc3Npb24nLCAnYmluYXJ5X2V4cHJlc3Npb24nLCAnbWVtYmVyX2V4cHJlc3Npb24nLFxuICAgICAgICAgICdzdGF0ZW1lbnRfYmxvY2snLCAncmV0dXJuX3N0YXRlbWVudCcsICdleHBvcnRfc3RhdGVtZW50JywgJ2V4cHJlc3Npb25fc3RhdGVtZW50JyxcbiAgICAgICAgICAvLyBBIGNhbGxfc2lnbmF0dXJlIGNhbiBhbHNvIGJlIGEgbm9uLWNvbnRleHR1YWwgbm9kZVxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXG4gICAgICAgICAgJ2ludGVybmFsX21vZHVsZScsXG4gICAgICAgICAgJ3ZhcmlhYmxlX2RlY2xhcmF0b3InLFxuICAgICAgICAgICdvYmplY3QnXG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICAgIH1cblxuICAgICAgICAvKiBNYXRjaCB0ZXJtaW5hbHMgKi9cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXG4gICAgICAgICAgJ2lkZW50aWZpZXInLCAnZXh0ZW5kcycsICdwcm9wZXJ0eV9pZGVudGlmaWVyJywgJ2FjY2Vzc2liaWxpdHlfbW9kaWZpZXInLFxuICAgICAgICAgICdzdHJpbmcnLCAndm9pZCcsICdib29sZWFuJywgJ251bGwnLCAndW5kZWZpbmVkJywgJ251bWJlcicsICdyZXR1cm4nLFxuICAgICAgICAgICdnZXQnLCAnZnVuY3Rpb24nLCAnbmFtZXNwYWNlJywgJ2NvbnN0J1xuICAgICAgICApKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUZXJtaW5hbChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvZ2dlci5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0Q2hpbGRyZW4gPSAobm9kZXM6IFN5bnRheE5vZGVbXSk6IEFTVE5vZGVbXSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICBpZiAoIW5vZGUudHlwZS5tYXRjaCgvWzw+KCl7fSw6O1xcW1xcXSZ8PVxcK1xcLVxcKlxcL10vKSAmJiBub2RlLnR5cGUgIT09ICcuLi4nKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy52aXNpdE5vZGUobm9kZSk7XG4gICAgICAgIGlmIChjaGlsZCkgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRQcm9ncmFtID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlW10gPT4ge1xuICAgIGxldCB2aXNpdGVkID0ge30sXG4gICAgICBnZXRTdGFydExvY2F0aW9uID0gKG46IEFTVE5vZGUpID0+IGAke24ubG9jYXRpb24ucm93LnN0YXJ0fToke24ubG9jYXRpb24uY29sdW1uLnN0YXJ0fWA7XG4gICAgLy8gQSBwcm9ncmFtIGNhbiBoYXZlIG1vZHVsZXMsIG5hbWVzcGFjZXMsIGNvbW1lbnRzIGFzIGl0cyBjaGlsZHJlblxuICAgIC8vIFRoZSBmaXJzdCBzdGVwIGlzIHRvIHBhcnNlIGFsbCB0aGUgY29tbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxuICAgIGxldCBjb21tZW50cyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2NvbW1lbnQnKSk7XG4gICAgLy8gUGFyc2UgdGhlIG5hbWVzcGFjZXMgaW4gZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgICBsZXQgbmFtZXNwYWNlcyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpO1xuICAgIC8vIFBhcnNlIHRoZSBleHBvcnQgc3RhdGVtZW50cyBpbiB0aGUgcm9vdCBub2RlXG4gICAgbGV0IGV4cG9ydHMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdleHBvcnRfc3RhdGVtZW50JykpO1xuXG4gICAgLy8gR2V0IHRoZSB2aXNpdGVkIGNvbnRleHQgbm9kZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjb21tZW50ID0gY29tbWVudHNbaV07XG4gICAgICBjb25zdCBjb250ZXh0ID0gY29tbWVudDtcbiAgICAgIHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbihjb250ZXh0KV0gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0aGUgdmlzaXRlZCBub2RlcyBmcm9tIG5hbWVzcGFjZXMgYXJyYXlcbiAgICBfLnJlbW92ZShuYW1lc3BhY2VzLCB4ID0+IHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pO1xuXG4gICAgLy8gRXhwb3J0cyBhcmUgb2RkYmFsbHMgc2luY2Ugc29tZSBleHBvcnRzIG1heSByZWZlcmVuY2VcbiAgICAvLyBhIHR5cGUvbm9kZSB0aGF0IG1heSBoYXZlIGJlZW4gY29tbWVudGVkLlxuICAgIC8vIFdlJ2xsIGZpcnN0IG5lZWQgdG8gZmlsdGVyIHRoZSBvbmVzIHdlIGhhdmUgdmlzaXRlZFxuICAgIF8ucmVtb3ZlKGV4cG9ydHMsIHggPT4gdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKHgpXSk7XG5cbiAgICAvLyBGcm9tIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQsIHdlJ2xsIG5lZWQgdG8gbW9kaWZ5XG4gICAgLy8gdGhlIG5vZGUgcHJvcGVydGllcyBvZiBlYWNoIGNvbnRleHQgaW4gYSBjb21tZW50IG5vZGUgdGhhdFxuICAgIC8vIG1hdGNoZXMgdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZC5cbiAgICBjb25zdCBtYXRjaGVkID0ge307XG4gICAgY29tbWVudHMgPSBfLmNvbXBhY3QoXG4gICAgICBjb21tZW50cy5tYXAoY29tbWVudCA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwb3J0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGV4cG9ydF8gPSBleHBvcnRzW2ldO1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50LmNvbnRleHQ7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGNvbnRleHQgJiYgaiA8IGNvbnRleHQuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmNoaWxkcmVuW2ldICYmIGNvbnRleHQuY2hpbGRyZW5baV0udHlwZSA9PT0gZXhwb3J0Xy50eXBlKSB7XG4gICAgICAgICAgICAgIG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbihleHBvcnRfKV0gPSB0cnVlO1xuICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnByb3BlcnRpZXMgfHwge30sXG4gICAgICAgICAgICAgICAgZXhwb3J0Xy5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tZW50O1xuICAgICAgfSkpO1xuXG4gICAgLy8gUmVtb3ZlZCB0aGUgbWF0Y2hlZCBleHBvcnRzXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiBtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKVxuXG4gICAgcmV0dXJuIFtdLmNvbmNhdChjb21tZW50cykuY29uY2F0KG5hbWVzcGFjZXMpLmNvbmNhdChleHBvcnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRDb21tZW50ID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkgJiYgIWlzTGVnYWxDb21tZW50KHRoaXMuc291cmNlLCBub2RlKSkge1xuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nKG5vZGUpO1xuICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q29udGV4dChuZXh0U2libGluZywge30pLCB0cnVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdCB0aGUgY29udGV4dHVhbCBub2RlXG4gICAqIFxuICAgKiAjIFJlbWFya1xuICAgKiBcbiAgICogQSBub2RlIGlzIGNvbnNpZGVyZWQgY29udGV4dHVhbCB3aGVuIGEgY29tbWVudCBpcyB2aXNpdGVkIGFuZCB0aGUgbm9kZSBpcyBpdHMgc2libGluZy5cbiAgICovXG4gIHByaXZhdGUgdmlzaXRDb250ZXh0ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdleHBvcnRfc3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHBvcnRTdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XG4gICAgICBjYXNlICdleHByZXNzaW9uX3N0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgIGNhc2UgJ2ludGVyZmFjZV9kZWNsYXJhdGlvbic6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q2xhc3NPckludGVyZmFjZShub2RlLCBwcm9wZXJ0aWVzKVxuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgY2FzZSAnY2FsbF9zaWduYXR1cmUnOlxuICAgICAgY2FzZSAnbWV0aG9kX3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdwcm9wZXJ0eV9zaWduYXR1cmUnOlxuICAgICAgY2FzZSAncHVibGljX2ZpZWxkX2RlZmluaXRpb24nOlxuICAgICAgY2FzZSAnbWV0aG9kX2RlZmluaXRpb24nOlxuICAgICAgY2FzZSAnbGV4aWNhbF9kZWNsYXJhdGlvbic6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSwgcHJvcGVydGllcyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLmxvZ2dlci5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qIFN0YXRlbWVudHMgKi9cblxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sIGRlZmF1bHRFeHBvcnQgPSBmYWxzZTtcbiAgICAvLyBSZW1vdmUgJ2V4cG9ydCcgc2luY2UgaXQncyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBpZiAodGhpcy5oYXNEZWZhdWx0RXhwb3J0KG5vZGUpKSB7XG4gICAgICBkZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XG4gICAgICBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkLCB7IGV4cG9ydHM6IHsgZXhwb3J0OiB0cnVlLCBkZWZhdWx0OiBkZWZhdWx0RXhwb3J0IH0gfSk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0RXhwcmVzc2lvblN0YXRlbWVudCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzOiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xuXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUoY2hpbGQsIHByb3BlcnRpZXMpXG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnZnVuY3Rpb24nKSkge1xuICAgICAgaWYgKHByb3BlcnRpZXMpIHJldHVybiB0aGlzLnZpc2l0Q29udGV4dChjaGlsZCwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChjaGlsZClcbiAgfVxuXG4gIC8qIE1vZHVsZXMgKi9cblxuICBwcml2YXRlIHZpc2l0SW50ZXJuYWxNb2R1bGUgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShjaGlsZCwgJ2NvbW1lbnQnKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQpO1xuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCBjaGlsZHJlbiwgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7IG5hbWVzcGFjZTogdHJ1ZSB9KSk7XG4gIH1cblxuXG4gIC8qIERlY2xhcmF0aW9ucyAqL1xuXG4gIHByaXZhdGUgdmlzaXRDbGFzc09ySW50ZXJmYWNlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIC8vIFNpbmNlICdpbnRlcmZhY2UnIG9yICdjbGFzcycgaXMgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxuICAgIC8vIHdlJ2xsIG5lZWQgdG8gcmVtb3ZlIGl0IGZyb20gdGhlIGFycmF5LlxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgY29uc3QgaW50ZXJmYWNlXyA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgbGV0IGV4dGVuZHNfID0gZmFsc2UsIGltcGxlbWVudHNfID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaGFzSW5oZXJpdGFuY2Uobm9kZSkpIHtcbiAgICAgIGNvbnN0IGluaGVyaXRhbmNlID0gdGhpcy5nZXRJbmhlcml0YW5jZVR5cGUobm9kZSlcbiAgICAgIGV4dGVuZHNfID0gaW5oZXJpdGFuY2UgPT09ICdleHRlbmRzJztcbiAgICAgIGltcGxlbWVudHNfID0gaW5oZXJpdGFuY2UgPT09ICdpbXBsZW1lbnRzJztcbiAgICB9XG5cbiAgICBjb25zdCBub2RlXyA9IGNyZWF0ZUFTVE5vZGUoXG4gICAgICB0aGlzLnNvdXJjZSxcbiAgICAgIG5vZGUsXG4gICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLFxuICAgICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7XG4gICAgICAgIGluaGVyaXRhbmNlOiB7XG4gICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c18sXG4gICAgICAgICAgZXh0ZW5kczogZXh0ZW5kc19cbiAgICAgICAgfSBhcyBUeXBlU2NyaXB0SW5oZXJpdGFuY2VcbiAgICAgIH0pKTtcblxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3MnKSkge1xuICAgICAgcmV0dXJuIG5vZGVfO1xuICAgIH1cbiAgICAvLyBPdmVyd3JpdGUgdGhlIG5vZGUgdHlwZSBmcm9tICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nIHRvICdpbnRlcmZhY2UnXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obm9kZV8sIHsgdHlwZTogaW50ZXJmYWNlXy50eXBlIH0pXG4gIH1cblxuICAvKiBOb24tdGVybWluYWxzICovXG5cbiAgcHJpdmF0ZSB2aXNpdE5vblRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgc29tZSBub24tdGVybWluYWxzXG4gICAgLy8gY29udGFpbiBjb21tZW50cyB3aGljaCBpcyB3aGF0IHdlIGNhcmUgYWJvdXRcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2NsYXNzX2JvZHknLCAnb2JqZWN0X3R5cGUnKSkge1xuICAgICAgY2hpbGRyZW4gPSB0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2NvbW1lbnQnKTtcbiAgICB9XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgZXhwb3J0IHN0YXRlbWVudHMgaGF2ZSBub2RlIHByb3BlcnRpZXNcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHBvcnRTdGF0ZW1lbnQobm9kZSk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYW4gaW50ZXJuYWwgbW9kdWxlIGNvbnRhaW5zIG90aGVyIG5vZGVzXG4gICAgaWYgKG1hdGNoKG5vZGUsICdpbnRlcm5hbF9tb2R1bGUnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm1hbF9tb2R1bGUgY2FuIGV4aXN0IGluIGFuIGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgaWYgKG1hdGNoKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKG5vZGUsICdmdW5jdGlvbicpIHx8IG1hdGNoKG5vZGUsICdtZXRob2RfZGVmaW5pdGlvbicpKSB7XG4gICAgICBfLnJlbW92ZShjaGlsZHJlbiwgY2hpbGQgPT4gbWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSlcbiAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XG4gIH1cblxuICAvKiBUZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0VGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxuICB9XG59Il19