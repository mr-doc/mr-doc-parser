"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("../common/ast");
const comment_1 = require("../../utils/comment");
const sibling_1 = require("../../utils/sibling");
const _ = require("lodash");
const log_1 = require("../../utils/log");
const match_1 = require("../../utils/match");
/**
 * A class that visits ASTNodes from a TypeScript tree.
 */
class TypeScriptVisitor {
    constructor(source) {
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
                    log_1.default.report(this.source, node, log_1.ErrorType.TreeSitterParseError);
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
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
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
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
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
            if (match_1.default(node, 'function')) {
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
        // console.time('filterType')
        let children = [];
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (match_1.default(child, type)) {
                children.push(child);
            }
        }
        // console.timeEnd('filterType')
        return children;
    }
    getAST() {
        return this.ast;
    }
}
exports.TypeScriptVisitor = TypeScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUN2RCxpREFBdUU7QUFHdkUsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBR3RDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUFvQyxFQUNwQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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L2NvbW1vbi9hc3RcIjtcbmltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQsIGlzTGVnYWxDb21tZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcbmltcG9ydCB7IE5vZGVQcm9wZXJ0aWVzLCBOb2RlSW5oZXJpdGFuY2UgfSBmcm9tIFwiLi4vY29tbW9uL2VtY2FcIjtcbmltcG9ydCB7IE5vZGVWaXNpdG9yIH0gZnJvbSBcIi4uL2NvbW1vbi9ub2RlXCI7XG5pbXBvcnQgeyBzaWJsaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NpYmxpbmdcIjtcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBsb2csIHsgRXJyb3JUeXBlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xvZ1wiO1xuaW1wb3J0IG1hdGNoIGZyb20gXCIuLi8uLi91dGlscy9tYXRjaFwiO1xuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgdmlzaXRzIEFTVE5vZGVzIGZyb20gYSBUeXBlU2NyaXB0IHRyZWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0VmlzaXRvciBpbXBsZW1lbnRzIE5vZGVWaXNpdG9yIHtcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXG4gIHByaXZhdGUgc291cmNlOiBTb3VyY2VcbiAgY29uc3RydWN0b3Ioc291cmNlOiBTb3VyY2UpIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBub2RlIGhhcyBpbmhlcml0YW5jZVxuICAgKi9cbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XG4gICAgbGV0IGluaGVyaXRzID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdleHRlbmRzJywgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICBpbmhlcml0cyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmhlcml0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbmhlcml0YW5jZVR5cGUobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycpKSB7XG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICByZXR1cm4gJ2ltcGxlbWVudHMnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZXhwb3J0IGlzIGRlZmF1bHRcbiAgICovXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9ubHkgdGhlIGNvbW1lbnRzIGZyb20gYSBub2RlJ3MgY2hpbGRyZW4uXG4gICAqL1xuICBwcml2YXRlIGZpbHRlclR5cGUobm9kZTogU3ludGF4Tm9kZSwgdHlwZTogc3RyaW5nKTogU3ludGF4Tm9kZVtdIHtcbiAgICAvLyBjb25zb2xlLnRpbWUoJ2ZpbHRlclR5cGUnKVxuICAgIGxldCBjaGlsZHJlbjogU3ludGF4Tm9kZVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsIHR5cGUpKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBjb25zb2xlLnRpbWVFbmQoJ2ZpbHRlclR5cGUnKVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIGdldEFTVCgpOiBBU1ROb2RlW10ge1xuICAgIHJldHVybiB0aGlzLmFzdDtcbiAgfVxuXG4gIC8qIFZpc2l0b3JzICAqL1xuXG4gIHZpc2l0Tm9kZSA9IChcbiAgICBub2RlOiBTeW50YXhOb2RlLFxuICAgIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPlxuICApID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAncHJvZ3JhbSc6XG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxuICAgICAgY2FzZSAnRVJST1InOlxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3IpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgLyogTWF0Y2ggb3RoZXIgbm9uLXRlcm1pbmFscyAqL1xuXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxuICAgICAgICAgICdjb25zdHJhaW50JyxcbiAgICAgICAgICAnZm9ybWFsX3BhcmFtZXRlcnMnLCAncmVxdWlyZWRfcGFyYW1ldGVyJywgJ3Jlc3RfcGFyYW1ldGVyJyxcbiAgICAgICAgICAndHlwZV9pZGVudGlmaWVyJywgJ3R5cGVfcGFyYW1ldGVycycsICd0eXBlX3BhcmFtZXRlcicsICd0eXBlX2Fubm90YXRpb24nLFxuICAgICAgICAgICdvYmplY3RfdHlwZScsICdwcmVkZWZpbmVkX3R5cGUnLCAncGFyZW50aGVzaXplZF90eXBlJywgJ2xpdGVyYWxfdHlwZScsXG4gICAgICAgICAgJ2ludGVyc2VjdGlvbl90eXBlJywgJ3VuaW9uX3R5cGUnLFxuICAgICAgICAgICdjbGFzc19ib2R5JyxcbiAgICAgICAgICAnZXh0ZW5kc19jbGF1c2UnLFxuICAgICAgICAgICd1bmFyeV9leHByZXNzaW9uJywgJ2JpbmFyeV9leHByZXNzaW9uJywgJ21lbWJlcl9leHByZXNzaW9uJyxcbiAgICAgICAgICAnc3RhdGVtZW50X2Jsb2NrJywgJ3JldHVybl9zdGF0ZW1lbnQnLCAnZXhwb3J0X3N0YXRlbWVudCcsICdleHByZXNzaW9uX3N0YXRlbWVudCcsXG4gICAgICAgICAgLy8gQSBjYWxsX3NpZ25hdHVyZSBjYW4gYWxzbyBiZSBhIG5vbi1jb250ZXh0dWFsIG5vZGVcbiAgICAgICAgICAnY2FsbF9zaWduYXR1cmUnLFxuICAgICAgICAgICdpbnRlcm5hbF9tb2R1bGUnLFxuICAgICAgICAgICd2YXJpYWJsZV9kZWNsYXJhdG9yJyxcbiAgICAgICAgICAnb2JqZWN0J1xuICAgICAgICApKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKVxuICAgICAgICB9XG5cbiAgICAgICAgLyogTWF0Y2ggdGVybWluYWxzICovXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxuICAgICAgICAgICdpZGVudGlmaWVyJywgJ2V4dGVuZHMnLCAncHJvcGVydHlfaWRlbnRpZmllcicsICdhY2Nlc3NpYmlsaXR5X21vZGlmaWVyJyxcbiAgICAgICAgICAnc3RyaW5nJywgJ3ZvaWQnLCAnYm9vbGVhbicsICdudWxsJywgJ3VuZGVmaW5lZCcsICdudW1iZXInLCAncmV0dXJuJyxcbiAgICAgICAgICAnZ2V0JywgJ2Z1bmN0aW9uJywgJ25hbWVzcGFjZScsICdjb25zdCdcbiAgICAgICAgKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0VGVybWluYWwobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRDaGlsZHJlbiA9IChub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdID0+IHtcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgIGlmICghbm9kZS50eXBlLm1hdGNoKC9bPD4oKXt9LDo7XFxbXFxdJnw9XFwrXFwtXFwqXFwvXS8pICYmIG5vZGUudHlwZSAhPT0gJy4uLicpIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnZpc2l0Tm9kZShub2RlKTtcbiAgICAgICAgaWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdFByb2dyYW0gPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGVbXSA9PiB7XG4gICAgbGV0IHZpc2l0ZWQgPSB7fSxcbiAgICAgIGdldFN0YXJ0TG9jYXRpb24gPSAobjogQVNUTm9kZSkgPT4gYCR7bi5sb2NhdGlvbi5yb3cuc3RhcnR9OiR7bi5sb2NhdGlvbi5jb2x1bW4uc3RhcnR9YDtcbiAgICAvLyBBIHByb2dyYW0gY2FuIGhhdmUgbW9kdWxlcywgbmFtZXNwYWNlcywgY29tbWVudHMgYXMgaXRzIGNoaWxkcmVuXG4gICAgLy8gVGhlIGZpcnN0IHN0ZXAgaXMgdG8gcGFyc2UgYWxsIHRoZSBjb21tZW50cyBpbiB0aGUgcm9vdCBub2RlXG4gICAgbGV0IGNvbW1lbnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpKTtcbiAgICAvLyBQYXJzZSB0aGUgbmFtZXNwYWNlcyBpbiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgIGxldCBuYW1lc3BhY2VzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSk7XG4gICAgLy8gUGFyc2UgdGhlIGV4cG9ydCBzdGF0ZW1lbnRzIGluIHRoZSByb290IG5vZGVcbiAgICBsZXQgZXhwb3J0cyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSk7XG5cbiAgICAvLyBHZXQgdGhlIHZpc2l0ZWQgY29udGV4dCBub2Rlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1tpXTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50O1xuICAgICAgdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKGNvbnRleHQpXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSB2aXNpdGVkIG5vZGVzIGZyb20gbmFtZXNwYWNlcyBhcnJheVxuICAgIF8ucmVtb3ZlKG5hbWVzcGFjZXMsIHggPT4gdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKHgpXSk7XG5cbiAgICAvLyBFeHBvcnRzIGFyZSBvZGRiYWxscyBzaW5jZSBzb21lIGV4cG9ydHMgbWF5IHJlZmVyZW5jZVxuICAgIC8vIGEgdHlwZS9ub2RlIHRoYXQgbWF5IGhhdmUgYmVlbiBjb21tZW50ZWQuXG4gICAgLy8gV2UnbGwgZmlyc3QgbmVlZCB0byBmaWx0ZXIgdGhlIG9uZXMgd2UgaGF2ZSB2aXNpdGVkXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcblxuICAgIC8vIEZyb20gdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZCwgd2UnbGwgbmVlZCB0byBtb2RpZnlcbiAgICAvLyB0aGUgbm9kZSBwcm9wZXJ0aWVzIG9mIGVhY2ggY29udGV4dCBpbiBhIGNvbW1lbnQgbm9kZSB0aGF0XG4gICAgLy8gbWF0Y2hlcyB0aGUgb25lcyB3ZSBoYXZlIG5vdCB2aXNpdGVkLlxuICAgIGNvbnN0IG1hdGNoZWQgPSB7fTtcbiAgICBjb21tZW50cyA9IF8uY29tcGFjdChcbiAgICAgIGNvbW1lbnRzLm1hcChjb21tZW50ID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBvcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZXhwb3J0XyA9IGV4cG9ydHNbaV07XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQuY29udGV4dDtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgY29udGV4dCAmJiBqIDwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuY2hpbGRyZW5baV0gJiYgY29udGV4dC5jaGlsZHJlbltpXS50eXBlID09PSBleHBvcnRfLnR5cGUpIHtcbiAgICAgICAgICAgICAgbWF0Y2hlZFtnZXRTdGFydExvY2F0aW9uKGV4cG9ydF8pXSA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyB8fCB7fSxcbiAgICAgICAgICAgICAgICBleHBvcnRfLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1lbnQ7XG4gICAgICB9KSk7XG5cbiAgICAvLyBSZW1vdmVkIHRoZSBtYXRjaGVkIGV4cG9ydHNcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pXG5cbiAgICByZXR1cm4gW10uY29uY2F0KGNvbW1lbnRzKS5jb25jYXQobmFtZXNwYWNlcykuY29uY2F0KGV4cG9ydHMpO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdENvbW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xuICAgIGlmIChpc0phdmFEb2NDb21tZW50KHRoaXMuc291cmNlLCBub2RlKSAmJiAhaXNMZWdhbENvbW1lbnQodGhpcy5zb3VyY2UsIG5vZGUpKSB7XG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IHNpYmxpbmcobm9kZSk7XG4gICAgICBpZiAobmV4dFNpYmxpbmcpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDb250ZXh0KG5leHRTaWJsaW5nLCB7fSksIHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZpc2l0IHRoZSBjb250ZXh0dWFsIG5vZGVcbiAgICogXG4gICAqICMgUmVtYXJrXG4gICAqIFxuICAgKiBBIG5vZGUgaXMgY29uc2lkZXJlZCBjb250ZXh0dWFsIHdoZW4gYSBjb21tZW50IGlzIHZpc2l0ZWQgYW5kIHRoZSBub2RlIGlzIGl0cyBzaWJsaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdENvbnRleHQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2V4cG9ydF9zdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGNhc2UgJ2V4cHJlc3Npb25fc3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgICAgY2FzZSAnY2xhc3MnOlxuICAgICAgY2FzZSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDbGFzc09ySW50ZXJmYWNlKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICBjYXNlICdjYWxsX3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdtZXRob2Rfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ3Byb3BlcnR5X3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdwdWJsaWNfZmllbGRfZGVmaW5pdGlvbic6XG4gICAgICBjYXNlICdtZXRob2RfZGVmaW5pdGlvbic6XG4gICAgICBjYXNlICdsZXhpY2FsX2RlY2xhcmF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qIFN0YXRlbWVudHMgKi9cblxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sIGRlZmF1bHRFeHBvcnQgPSBmYWxzZTtcbiAgICAvLyBSZW1vdmUgJ2V4cG9ydCcgc2luY2UgaXQncyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBpZiAodGhpcy5oYXNEZWZhdWx0RXhwb3J0KG5vZGUpKSB7XG4gICAgICBkZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XG4gICAgICBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkLCB7IGV4cG9ydHM6IHsgZXhwb3J0OiB0cnVlLCBkZWZhdWx0OiBkZWZhdWx0RXhwb3J0IH0gfSk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0RXhwcmVzc2lvblN0YXRlbWVudCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzOiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xuXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUoY2hpbGQsIHByb3BlcnRpZXMpXG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnZnVuY3Rpb24nKSkge1xuICAgICAgaWYgKHByb3BlcnRpZXMpIHJldHVybiB0aGlzLnZpc2l0Q29udGV4dChjaGlsZCwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChjaGlsZClcbiAgfVxuXG4gIC8qIE1vZHVsZXMgKi9cblxuICBwcml2YXRlIHZpc2l0SW50ZXJuYWxNb2R1bGUgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShjaGlsZCwgJ2NvbW1lbnQnKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQpO1xuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCBjaGlsZHJlbiwgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7IG5hbWVzcGFjZTogdHJ1ZSB9KSk7XG4gIH1cblxuXG4gIC8qIERlY2xhcmF0aW9ucyAqL1xuXG4gIHByaXZhdGUgdmlzaXRDbGFzc09ySW50ZXJmYWNlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIC8vIFNpbmNlICdpbnRlcmZhY2UnIG9yICdjbGFzcycgaXMgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxuICAgIC8vIHdlJ2xsIG5lZWQgdG8gcmVtb3ZlIGl0IGZyb20gdGhlIGFycmF5LlxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgY29uc3QgaW50ZXJmYWNlXyA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgbGV0IGV4dGVuZHNfID0gZmFsc2UsIGltcGxlbWVudHNfID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaGFzSW5oZXJpdGFuY2Uobm9kZSkpIHtcbiAgICAgIGNvbnN0IGluaGVyaXRhbmNlID0gdGhpcy5nZXRJbmhlcml0YW5jZVR5cGUobm9kZSlcbiAgICAgIGV4dGVuZHNfID0gaW5oZXJpdGFuY2UgPT09ICdleHRlbmRzJztcbiAgICAgIGltcGxlbWVudHNfID0gaW5oZXJpdGFuY2UgPT09ICdpbXBsZW1lbnRzJztcbiAgICB9XG5cbiAgICBjb25zdCBub2RlXyA9IGNyZWF0ZUFTVE5vZGUoXG4gICAgICB0aGlzLnNvdXJjZSxcbiAgICAgIG5vZGUsXG4gICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLFxuICAgICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7XG4gICAgICAgIGluaGVyaXRhbmNlOiB7XG4gICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c18sXG4gICAgICAgICAgZXh0ZW5kczogZXh0ZW5kc19cbiAgICAgICAgfSBhcyBOb2RlSW5oZXJpdGFuY2VcbiAgICAgIH0pKTtcblxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3MnKSkge1xuICAgICAgcmV0dXJuIG5vZGVfO1xuICAgIH1cbiAgICAvLyBPdmVyd3JpdGUgdGhlIG5vZGUgdHlwZSBmcm9tICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nIHRvICdpbnRlcmZhY2UnXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obm9kZV8sIHsgdHlwZTogaW50ZXJmYWNlXy50eXBlIH0pXG4gIH1cblxuICAvKiBOb24tdGVybWluYWxzICovXG5cbiAgcHJpdmF0ZSB2aXNpdE5vblRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgc29tZSBub24tdGVybWluYWxzXG4gICAgLy8gY29udGFpbiBjb21tZW50cyB3aGljaCBpcyB3aGF0IHdlIGNhcmUgYWJvdXRcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2NsYXNzX2JvZHknLCAnb2JqZWN0X3R5cGUnKSkge1xuICAgICAgY2hpbGRyZW4gPSB0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2NvbW1lbnQnKTtcbiAgICB9XG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgZXhwb3J0IHN0YXRlbWVudHMgaGF2ZSBub2RlIHByb3BlcnRpZXNcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHBvcnRTdGF0ZW1lbnQobm9kZSk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYW4gaW50ZXJuYWwgbW9kdWxlIGNvbnRhaW5zIG90aGVyIG5vZGVzXG4gICAgaWYgKG1hdGNoKG5vZGUsICdpbnRlcm5hbF9tb2R1bGUnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm1hbF9tb2R1bGUgY2FuIGV4aXN0IGluIGFuIGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgaWYgKG1hdGNoKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKG5vZGUsICdmdW5jdGlvbicpKSB7XG4gICAgICBfLnJlbW92ZShjaGlsZHJlbiwgY2hpbGQgPT4gbWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSlcbiAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XG4gIH1cblxuICAvKiBUZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0VGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxuICB9XG59Il19