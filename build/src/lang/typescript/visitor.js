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
                    if (match_1.default(node, 'constraint', 'formal_parameters', 'required_parameter', 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type', 'predefined_type', 'parenthesized_type', 'literal_type', 'intersection_type', 'union_type', 'class_body', 'extends_clause', 'unary_expression', 'binary_expression', 'statement_block', 'return_statement', 'export_statement', 'expression_statement', 
                    // A call_signature can also be a non-contextual node
                    'call_signature', 'internal_module')) {
                        return this.visitNonTerminal(node, properties);
                    }
                    /* Match terminals */
                    if (match_1.default(node, 'identifier', 'extends', 'property_identifier', 'accessibility_modifier', 'string', 'void', 'boolean', 'null', 'undefined', 'number', 'return', 'get', 'function', 'namespace')) {
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
                if (!node.type.match(/[<>(){},:;\[\]&|=\+\-\*\/]/)) {
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
            namespaces = _.remove(namespaces, x => !visited[getStartLocation(x)]);
            // Exports are oddballs since some exports may reference
            // a type/node that may have been commented.
            // We'll first need to filter the ones we have visited
            exports = _.remove(exports, x => !visited[getStartLocation(x)]);
            // From the ones we have not visited, we'll need to modify
            // the node properties of each context in a comment node that
            // matches the ones we have not visited.
            const matched = {};
            comments = _.remove(comments.map(comment => {
                for (let i = 0; i < exports.length; i++) {
                    const export_ = exports[i];
                    if (comment.context.type === export_.type) {
                        matched[getStartLocation(export_)] = true;
                        comment.context.properties = Object.assign(comment.context.properties || {}, export_.properties);
                        return comment;
                    }
                }
            }), (comment) => !comment);
            // Removed the matched exports
            exports = _.remove(exports, x => !matched[getStartLocation(x)]);
            return [].concat(comments).concat(namespaces).concat(exports);
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
                case 'interface_declaration':
                    return this.visitClassOrInterface(node, properties);
                case 'function':
                case 'call_signature':
                case 'method_signature':
                case 'property_signature':
                case 'public_field_definition':
                case 'method_definition':
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
            return this.visitNonTerminal(node);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUN2RCxpREFBdUQ7QUFHdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBR3RDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUFvQyxFQUNwQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFDekMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0IsRUFBRSxtQkFBbUIs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RSxJQUFJLENBQUMsRUFBRTtnQkFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN0QjtTQUNGO1FBQ0QsZ0NBQWdDO1FBQ2hDLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0ErUEY7QUFuVUQsOENBbVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQVNUTm9kZSwgQVNUTm9kZSB9IGZyb20gXCIuLi9jb21tb24vYXN0XCI7XG5pbXBvcnQgeyBpc0phdmFEb2NDb21tZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcbmltcG9ydCB7IE5vZGVQcm9wZXJ0aWVzLCBOb2RlSW5oZXJpdGFuY2UgfSBmcm9tIFwiLi4vY29tbW9uL2VtY2FcIjtcbmltcG9ydCB7IE5vZGVWaXNpdG9yIH0gZnJvbSBcIi4uL2NvbW1vbi9ub2RlXCI7XG5pbXBvcnQgeyBzaWJsaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NpYmxpbmdcIjtcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBsb2csIHsgRXJyb3JUeXBlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xvZ1wiO1xuaW1wb3J0IG1hdGNoIGZyb20gXCIuLi8uLi91dGlscy9tYXRjaFwiO1xuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgdmlzaXRzIEFTVE5vZGVzIGZyb20gYSBUeXBlU2NyaXB0IHRyZWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0VmlzaXRvciBpbXBsZW1lbnRzIE5vZGVWaXNpdG9yIHtcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXG4gIHByaXZhdGUgc291cmNlOiBTb3VyY2VcbiAgY29uc3RydWN0b3Ioc291cmNlOiBTb3VyY2UpIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBub2RlIGhhcyBpbmhlcml0YW5jZVxuICAgKi9cbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XG4gICAgbGV0IGluaGVyaXRzID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdleHRlbmRzJywgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICBpbmhlcml0cyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmhlcml0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbmhlcml0YW5jZVR5cGUobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycpKSB7XG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICByZXR1cm4gJ2ltcGxlbWVudHMnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZXhwb3J0IGlzIGRlZmF1bHRcbiAgICovXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9ubHkgdGhlIGNvbW1lbnRzIGZyb20gYSBub2RlJ3MgY2hpbGRyZW4uXG4gICAqL1xuICBwcml2YXRlIGZpbHRlclR5cGUobm9kZTogU3ludGF4Tm9kZSwgdHlwZTogc3RyaW5nKTogU3ludGF4Tm9kZVtdIHtcbiAgICAvLyBjb25zb2xlLnRpbWUoJ2ZpbHRlclR5cGUnKVxuICAgIGxldCBjaGlsZHJlbjogU3ludGF4Tm9kZVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsIHR5cGUpKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBjb25zb2xlLnRpbWVFbmQoJ2ZpbHRlclR5cGUnKVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIGdldEFTVCgpOiBBU1ROb2RlW10ge1xuICAgIHJldHVybiB0aGlzLmFzdDtcbiAgfVxuXG4gIC8qIFZpc2l0b3JzICAqL1xuXG4gIHZpc2l0Tm9kZSA9IChcbiAgICBub2RlOiBTeW50YXhOb2RlLFxuICAgIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPlxuICApID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAncHJvZ3JhbSc6XG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxuICAgICAgY2FzZSAnRVJST1InOlxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3IpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgLyogTWF0Y2ggb3RoZXIgbm9uLXRlcm1pbmFscyAqL1xuXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxuICAgICAgICAgICdjb25zdHJhaW50JyxcbiAgICAgICAgICAnZm9ybWFsX3BhcmFtZXRlcnMnLCAncmVxdWlyZWRfcGFyYW1ldGVyJyxcbiAgICAgICAgICAndHlwZV9pZGVudGlmaWVyJywgJ3R5cGVfcGFyYW1ldGVycycsICd0eXBlX3BhcmFtZXRlcicsICd0eXBlX2Fubm90YXRpb24nLFxuICAgICAgICAgICdvYmplY3RfdHlwZScsICdwcmVkZWZpbmVkX3R5cGUnLCAncGFyZW50aGVzaXplZF90eXBlJywgJ2xpdGVyYWxfdHlwZScsXG4gICAgICAgICAgJ2ludGVyc2VjdGlvbl90eXBlJywgJ3VuaW9uX3R5cGUnLFxuICAgICAgICAgICdjbGFzc19ib2R5JyxcbiAgICAgICAgICAnZXh0ZW5kc19jbGF1c2UnLFxuICAgICAgICAgICd1bmFyeV9leHByZXNzaW9uJywgJ2JpbmFyeV9leHByZXNzaW9uJyxcbiAgICAgICAgICAnc3RhdGVtZW50X2Jsb2NrJywgJ3JldHVybl9zdGF0ZW1lbnQnLCAnZXhwb3J0X3N0YXRlbWVudCcsICdleHByZXNzaW9uX3N0YXRlbWVudCcsXG4gICAgICAgICAgLy8gQSBjYWxsX3NpZ25hdHVyZSBjYW4gYWxzbyBiZSBhIG5vbi1jb250ZXh0dWFsIG5vZGVcbiAgICAgICAgICAnY2FsbF9zaWduYXR1cmUnLFxuICAgICAgICAgICdpbnRlcm5hbF9tb2R1bGUnXG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICAgIH1cblxuICAgICAgICAvKiBNYXRjaCB0ZXJtaW5hbHMgKi9cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXG4gICAgICAgICAgJ2lkZW50aWZpZXInLCAnZXh0ZW5kcycsICdwcm9wZXJ0eV9pZGVudGlmaWVyJywgJ2FjY2Vzc2liaWxpdHlfbW9kaWZpZXInLFxuICAgICAgICAgICdzdHJpbmcnLCAndm9pZCcsICdib29sZWFuJywgJ251bGwnLCAndW5kZWZpbmVkJywgJ251bWJlcicsICdyZXR1cm4nLFxuICAgICAgICAgICdnZXQnLCAnZnVuY3Rpb24nLCAnbmFtZXNwYWNlJ1xuICAgICAgICApKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUZXJtaW5hbChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2aXNpdENoaWxkcmVuID0gKG5vZGVzOiBTeW50YXhOb2RlW10pOiBBU1ROb2RlW10gPT4ge1xuICAgIGxldCBjaGlsZHJlbjogQVNUTm9kZVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgaWYgKCFub2RlLnR5cGUubWF0Y2goL1s8Pigpe30sOjtcXFtcXF0mfD1cXCtcXC1cXCpcXC9dLykpIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnZpc2l0Tm9kZShub2RlKTtcbiAgICAgICAgaWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdFByb2dyYW0gPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGVbXSA9PiB7XG4gICAgbGV0IHZpc2l0ZWQgPSB7fSxcbiAgICAgIGdldFN0YXJ0TG9jYXRpb24gPSAobjogQVNUTm9kZSkgPT4gYCR7bi5sb2NhdGlvbi5yb3cuc3RhcnR9OiR7bi5sb2NhdGlvbi5jb2x1bW4uc3RhcnR9YDtcbiAgICAvLyBBIHByb2dyYW0gY2FuIGhhdmUgbW9kdWxlcywgbmFtZXNwYWNlcywgY29tbWVudHMgYXMgaXRzIGNoaWxkcmVuXG4gICAgLy8gVGhlIGZpcnN0IHN0ZXAgaXMgdG8gcGFyc2UgYWxsIHRoZSBjb21tZW50cyBpbiB0aGUgcm9vdCBub2RlXG4gICAgbGV0IGNvbW1lbnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpKTtcbiAgICAvLyBQYXJzZSB0aGUgbmFtZXNwYWNlcyBpbiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgIGxldCBuYW1lc3BhY2VzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSk7XG4gICAgLy8gUGFyc2UgdGhlIGV4cG9ydCBzdGF0ZW1lbnRzIGluIHRoZSByb290IG5vZGVcbiAgICBsZXQgZXhwb3J0cyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSk7XG5cbiAgICAvLyBHZXQgdGhlIHZpc2l0ZWQgY29udGV4dCBub2Rlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1tpXTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50O1xuICAgICAgdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKGNvbnRleHQpXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSB2aXNpdGVkIG5vZGVzIGZyb20gbmFtZXNwYWNlcyBhcnJheVxuICAgIG5hbWVzcGFjZXMgPSBfLnJlbW92ZShuYW1lc3BhY2VzLCB4ID0+ICF2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcblxuICAgIC8vIEV4cG9ydHMgYXJlIG9kZGJhbGxzIHNpbmNlIHNvbWUgZXhwb3J0cyBtYXkgcmVmZXJlbmNlXG4gICAgLy8gYSB0eXBlL25vZGUgdGhhdCBtYXkgaGF2ZSBiZWVuIGNvbW1lbnRlZC5cbiAgICAvLyBXZSdsbCBmaXJzdCBuZWVkIHRvIGZpbHRlciB0aGUgb25lcyB3ZSBoYXZlIHZpc2l0ZWRcbiAgICBleHBvcnRzID0gXy5yZW1vdmUoZXhwb3J0cywgeCA9PiAhdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKHgpXSk7XG5cbiAgICAvLyBGcm9tIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQsIHdlJ2xsIG5lZWQgdG8gbW9kaWZ5XG4gICAgLy8gdGhlIG5vZGUgcHJvcGVydGllcyBvZiBlYWNoIGNvbnRleHQgaW4gYSBjb21tZW50IG5vZGUgdGhhdFxuICAgIC8vIG1hdGNoZXMgdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZC5cbiAgICBjb25zdCBtYXRjaGVkID0ge307XG4gICAgY29tbWVudHMgPSBfLnJlbW92ZShcbiAgICAgIGNvbW1lbnRzLm1hcChjb21tZW50ID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBvcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZXhwb3J0XyA9IGV4cG9ydHNbaV07XG4gICAgICAgICAgaWYgKGNvbW1lbnQuY29udGV4dC50eXBlID09PSBleHBvcnRfLnR5cGUpIHtcbiAgICAgICAgICAgIG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbihleHBvcnRfKV0gPSB0cnVlO1xuICAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyB8fCB7fSxcbiAgICAgICAgICAgICAgZXhwb3J0Xy5wcm9wZXJ0aWVzXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIGNvbW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSwgKGNvbW1lbnQpID0+ICFjb21tZW50KTtcblxuICAgIC8vIFJlbW92ZWQgdGhlIG1hdGNoZWQgZXhwb3J0c1xuICAgIGV4cG9ydHMgPSBfLnJlbW92ZShleHBvcnRzLCB4ID0+ICFtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKVxuXG4gICAgcmV0dXJuIFtdLmNvbmNhdChjb21tZW50cykuY29uY2F0KG5hbWVzcGFjZXMpLmNvbmNhdChleHBvcnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRDb21tZW50ID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZyhub2RlKTtcbiAgICAgIGlmIChuZXh0U2libGluZykge1xuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENvbnRleHQobmV4dFNpYmxpbmcsIHt9KSwgdHJ1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmlzaXQgdGhlIGNvbnRleHR1YWwgbm9kZVxuICAgKiBcbiAgICogIyBSZW1hcmtcbiAgICogXG4gICAqIEEgbm9kZSBpcyBjb25zaWRlcmVkIGNvbnRleHR1YWwgd2hlbiBhIGNvbW1lbnQgaXMgdmlzaXRlZCBhbmQgdGhlIG5vZGUgaXMgaXRzIHNpYmxpbmcuXG4gICAqL1xuICBwcml2YXRlIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnZXhwb3J0X3N0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgICAgY2FzZSAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XG4gICAgICBjYXNlICdjbGFzcyc6XG4gICAgICBjYXNlICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENsYXNzT3JJbnRlcmZhY2Uobm9kZSwgcHJvcGVydGllcylcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIGNhc2UgJ2NhbGxfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ21ldGhvZF9zaWduYXR1cmUnOlxuICAgICAgY2FzZSAncHJvcGVydHlfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ3B1YmxpY19maWVsZF9kZWZpbml0aW9uJzpcbiAgICAgIGNhc2UgJ21ldGhvZF9kZWZpbml0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qIFN0YXRlbWVudHMgKi9cblxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sIGRlZmF1bHRFeHBvcnQgPSBmYWxzZTtcbiAgICAvLyBSZW1vdmUgJ2V4cG9ydCcgc2luY2UgaXQncyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBpZiAodGhpcy5oYXNEZWZhdWx0RXhwb3J0KG5vZGUpKSB7XG4gICAgICBkZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XG4gICAgICBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkLCB7IGV4cG9ydHM6IHsgZXhwb3J0OiB0cnVlLCBkZWZhdWx0OiBkZWZhdWx0RXhwb3J0IH0gfSk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0RXhwcmVzc2lvblN0YXRlbWVudCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzOiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIGlmIChtYXRjaChjaGlsZCwgJ2ludGVybmFsX21vZHVsZScpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKGNoaWxkLCBwcm9wZXJ0aWVzKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUpO1xuICB9XG5cbiAgLyogTW9kdWxlcyAqL1xuXG4gIHByaXZhdGUgdmlzaXRJbnRlcm5hbE1vZHVsZSA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IG5vZGUuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ3N0YXRlbWVudF9ibG9jaycpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKGNoaWxkLCAnY29tbWVudCcpKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9kZShjaGlsZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIGNoaWxkcmVuLCBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHsgbmFtZXNwYWNlOiB0cnVlIH0pKTtcbiAgfVxuXG5cbiAgLyogRGVjbGFyYXRpb25zICovXG5cbiAgcHJpdmF0ZSB2aXNpdENsYXNzT3JJbnRlcmZhY2UgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgLy8gU2luY2UgJ2ludGVyZmFjZScgb3IgJ2NsYXNzJyBpcyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgLy8gd2UnbGwgbmVlZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXkuXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICBjb25zdCBpbnRlcmZhY2VfID0gY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBsZXQgZXh0ZW5kc18gPSBmYWxzZSwgaW1wbGVtZW50c18gPSBmYWxzZTtcbiAgICBpZiAodGhpcy5oYXNJbmhlcml0YW5jZShub2RlKSkge1xuICAgICAgY29uc3QgaW5oZXJpdGFuY2UgPSB0aGlzLmdldEluaGVyaXRhbmNlVHlwZShub2RlKVxuICAgICAgZXh0ZW5kc18gPSBpbmhlcml0YW5jZSA9PT0gJ2V4dGVuZHMnO1xuICAgICAgaW1wbGVtZW50c18gPSBpbmhlcml0YW5jZSA9PT0gJ2ltcGxlbWVudHMnO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGVfID0gY3JlYXRlQVNUTm9kZShcbiAgICAgIHRoaXMuc291cmNlLFxuICAgICAgbm9kZSxcbiAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksXG4gICAgICBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHtcbiAgICAgICAgaW5oZXJpdGFuY2U6IHtcbiAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzXyxcbiAgICAgICAgICBleHRlbmRzOiBleHRlbmRzX1xuICAgICAgICB9IGFzIE5vZGVJbmhlcml0YW5jZVxuICAgICAgfSkpO1xuXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzcycpKSB7XG4gICAgICByZXR1cm4gbm9kZV87XG4gICAgfVxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgbm9kZSB0eXBlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihub2RlXywgeyB0eXBlOiBpbnRlcmZhY2VfLnR5cGUgfSlcbiAgfVxuXG4gIC8qIE5vbi10ZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0Tm9uVGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBzb21lIG5vbi10ZXJtaW5hbHNcbiAgICAvLyBjb250YWluIGNvbW1lbnRzIHdoaWNoIGlzIHdoYXQgd2UgY2FyZSBhYm91dFxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3NfYm9keScsICdvYmplY3RfdHlwZScpKSB7XG4gICAgICBjaGlsZHJlbiA9IHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBleHBvcnQgc3RhdGVtZW50cyBoYXZlIG5vZGUgcHJvcGVydGllc1xuICAgIGlmIChtYXRjaChub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm5hbCBtb2R1bGUgY29udGFpbnMgb3RoZXIgbm9kZXNcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2ludGVybmFsX21vZHVsZScpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKG5vZGUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybWFsX21vZHVsZSBjYW4gZXhpc3QgaW4gYW4gZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cblxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcbiAgfVxuXG4gIC8qIFRlcm1pbmFscyAqL1xuXG4gIHByaXZhdGUgdmlzaXRUZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUpXG4gIH1cbn0iXX0=