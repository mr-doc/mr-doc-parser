"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../utils/comment");
const sibling_1 = require("../../utils/sibling");
const _ = require("lodash");
const log_1 = require("../../utils/log");
const match_1 = require("../../utils/match");
const ast_1 = require("../common/ast");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUF1RTtBQUN2RSxpREFBOEM7QUFFOUMsNEJBQTRCO0FBQzVCLHlDQUFpRDtBQUNqRCw2Q0FBc0M7QUFJdEMsdUNBQThDO0FBRzlDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFtRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUEwQyxFQUMxQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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YWxDb21tZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcbmltcG9ydCB7IHNpYmxpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2libGluZ1wiO1xuaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbG9nXCI7XG5pbXBvcnQgbWF0Y2ggZnJvbSBcIi4uLy4uL3V0aWxzL21hdGNoXCI7XG5pbXBvcnQgU291cmNlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xuaW1wb3J0IFZpc2l0b3IgZnJvbSBcIi4uL2NvbW1vbi92aXNpdG9yXCI7XG5pbXBvcnQgQVNUTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9BU1ROb2RlXCI7XG5pbXBvcnQgeyBjcmVhdGVBU1ROb2RlIH0gZnJvbSBcIi4uL2NvbW1vbi9hc3RcIjtcbmltcG9ydCB7IFR5cGVTY3JpcHRQcm9wZXJ0aWVzLCBUeXBlU2NyaXB0SW5oZXJpdGFuY2UgfSBmcm9tIFwiLi9wcm9wZXJ0aWVzXCI7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHZpc2l0cyBBU1ROb2RlcyBmcm9tIGEgVHlwZVNjcmlwdCB0cmVlLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZVNjcmlwdFZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yIHtcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXG4gIHByaXZhdGUgc291cmNlOiBTb3VyY2VcbiAgY29uc3RydWN0b3Ioc291cmNlOiBTb3VyY2UpIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBub2RlIGhhcyBpbmhlcml0YW5jZVxuICAgKi9cbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XG4gICAgbGV0IGluaGVyaXRzID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdleHRlbmRzJywgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICBpbmhlcml0cyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmhlcml0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbmhlcml0YW5jZVR5cGUobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycpKSB7XG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xuICAgICAgICByZXR1cm4gJ2ltcGxlbWVudHMnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZXhwb3J0IGlzIGRlZmF1bHRcbiAgICovXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9ubHkgdGhlIGNvbW1lbnRzIGZyb20gYSBub2RlJ3MgY2hpbGRyZW4uXG4gICAqL1xuICBwcml2YXRlIGZpbHRlclR5cGUobm9kZTogU3ludGF4Tm9kZSwgdHlwZTogc3RyaW5nKTogU3ludGF4Tm9kZVtdIHtcbiAgICBsZXQgY2hpbGRyZW46IFN5bnRheE5vZGVbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCB0eXBlKSkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG5cbiAgZ2V0QVNUKCk6IEFTVE5vZGVbXSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0O1xuICB9XG5cbiAgLyogVmlzaXRvcnMgICovXG5cbiAgdmlzaXROb2RlID0gKFxuICAgIG5vZGU6IFN5bnRheE5vZGUsXG4gICAgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+XG4gICkgPT4ge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdwcm9ncmFtJzpcbiAgICAgICAgdGhpcy5hc3QgPSB0aGlzLnZpc2l0UHJvZ3JhbShub2RlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDb21tZW50KG5vZGUpO1xuICAgICAgY2FzZSAnTUlTU0lORyc6XG4gICAgICBjYXNlICdFUlJPUic6XG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5UcmVlU2l0dGVyUGFyc2VFcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcblxuICAgICAgICAvKiBNYXRjaCBvdGhlciBub24tdGVybWluYWxzICovXG5cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXG4gICAgICAgICAgJ2NvbnN0cmFpbnQnLFxuICAgICAgICAgICdmb3JtYWxfcGFyYW1ldGVycycsICdyZXF1aXJlZF9wYXJhbWV0ZXInLCAncmVzdF9wYXJhbWV0ZXInLFxuICAgICAgICAgICd0eXBlX2lkZW50aWZpZXInLCAndHlwZV9wYXJhbWV0ZXJzJywgJ3R5cGVfcGFyYW1ldGVyJywgJ3R5cGVfYW5ub3RhdGlvbicsXG4gICAgICAgICAgJ29iamVjdF90eXBlJywgJ3ByZWRlZmluZWRfdHlwZScsICdwYXJlbnRoZXNpemVkX3R5cGUnLCAnbGl0ZXJhbF90eXBlJyxcbiAgICAgICAgICAnaW50ZXJzZWN0aW9uX3R5cGUnLCAndW5pb25fdHlwZScsXG4gICAgICAgICAgJ2NsYXNzX2JvZHknLFxuICAgICAgICAgICdleHRlbmRzX2NsYXVzZScsXG4gICAgICAgICAgJ3VuYXJ5X2V4cHJlc3Npb24nLCAnYmluYXJ5X2V4cHJlc3Npb24nLCAnbWVtYmVyX2V4cHJlc3Npb24nLFxuICAgICAgICAgICdzdGF0ZW1lbnRfYmxvY2snLCAncmV0dXJuX3N0YXRlbWVudCcsICdleHBvcnRfc3RhdGVtZW50JywgJ2V4cHJlc3Npb25fc3RhdGVtZW50JyxcbiAgICAgICAgICAvLyBBIGNhbGxfc2lnbmF0dXJlIGNhbiBhbHNvIGJlIGEgbm9uLWNvbnRleHR1YWwgbm9kZVxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXG4gICAgICAgICAgJ2ludGVybmFsX21vZHVsZScsXG4gICAgICAgICAgJ3ZhcmlhYmxlX2RlY2xhcmF0b3InLFxuICAgICAgICAgICdvYmplY3QnXG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICAgIH1cblxuICAgICAgICAvKiBNYXRjaCB0ZXJtaW5hbHMgKi9cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXG4gICAgICAgICAgJ2lkZW50aWZpZXInLCAnZXh0ZW5kcycsICdwcm9wZXJ0eV9pZGVudGlmaWVyJywgJ2FjY2Vzc2liaWxpdHlfbW9kaWZpZXInLFxuICAgICAgICAgICdzdHJpbmcnLCAndm9pZCcsICdib29sZWFuJywgJ251bGwnLCAndW5kZWZpbmVkJywgJ251bWJlcicsICdyZXR1cm4nLFxuICAgICAgICAgICdnZXQnLCAnZnVuY3Rpb24nLCAnbmFtZXNwYWNlJywgJ2NvbnN0J1xuICAgICAgICApKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUZXJtaW5hbChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2aXNpdENoaWxkcmVuID0gKG5vZGVzOiBTeW50YXhOb2RlW10pOiBBU1ROb2RlW10gPT4ge1xuICAgIGxldCBjaGlsZHJlbjogQVNUTm9kZVtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgaWYgKCFub2RlLnR5cGUubWF0Y2goL1s8Pigpe30sOjtcXFtcXF0mfD1cXCtcXC1cXCpcXC9dLykgJiYgbm9kZS50eXBlICE9PSAnLi4uJykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMudmlzaXROb2RlKG5vZGUpO1xuICAgICAgICBpZiAoY2hpbGQpIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICBwcml2YXRlIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcbiAgICBsZXQgdmlzaXRlZCA9IHt9LFxuICAgICAgZ2V0U3RhcnRMb2NhdGlvbiA9IChuOiBBU1ROb2RlKSA9PiBgJHtuLmxvY2F0aW9uLnJvdy5zdGFydH06JHtuLmxvY2F0aW9uLmNvbHVtbi5zdGFydH1gO1xuICAgIC8vIEEgcHJvZ3JhbSBjYW4gaGF2ZSBtb2R1bGVzLCBuYW1lc3BhY2VzLCBjb21tZW50cyBhcyBpdHMgY2hpbGRyZW5cbiAgICAvLyBUaGUgZmlyc3Qgc3RlcCBpcyB0byBwYXJzZSBhbGwgdGhlIGNvbW1lbnRzIGluIHRoZSByb290IG5vZGVcbiAgICBsZXQgY29tbWVudHMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50JykpO1xuICAgIC8vIFBhcnNlIHRoZSBuYW1lc3BhY2VzIGluIGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgbGV0IG5hbWVzcGFjZXMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKTtcbiAgICAvLyBQYXJzZSB0aGUgZXhwb3J0IHN0YXRlbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxuICAgIGxldCBleHBvcnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKTtcblxuICAgIC8vIEdldCB0aGUgdmlzaXRlZCBjb250ZXh0IG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29tbWVudCA9IGNvbW1lbnRzW2ldO1xuICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQ7XG4gICAgICB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oY29udGV4dCldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIHZpc2l0ZWQgbm9kZXMgZnJvbSBuYW1lc3BhY2VzIGFycmF5XG4gICAgXy5yZW1vdmUobmFtZXNwYWNlcywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcblxuICAgIC8vIEV4cG9ydHMgYXJlIG9kZGJhbGxzIHNpbmNlIHNvbWUgZXhwb3J0cyBtYXkgcmVmZXJlbmNlXG4gICAgLy8gYSB0eXBlL25vZGUgdGhhdCBtYXkgaGF2ZSBiZWVuIGNvbW1lbnRlZC5cbiAgICAvLyBXZSdsbCBmaXJzdCBuZWVkIHRvIGZpbHRlciB0aGUgb25lcyB3ZSBoYXZlIHZpc2l0ZWRcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pO1xuXG4gICAgLy8gRnJvbSB0aGUgb25lcyB3ZSBoYXZlIG5vdCB2aXNpdGVkLCB3ZSdsbCBuZWVkIHRvIG1vZGlmeVxuICAgIC8vIHRoZSBub2RlIHByb3BlcnRpZXMgb2YgZWFjaCBjb250ZXh0IGluIGEgY29tbWVudCBub2RlIHRoYXRcbiAgICAvLyBtYXRjaGVzIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQuXG4gICAgY29uc3QgbWF0Y2hlZCA9IHt9O1xuICAgIGNvbW1lbnRzID0gXy5jb21wYWN0KFxuICAgICAgY29tbWVudHMubWFwKGNvbW1lbnQgPT4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV4cG9ydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBleHBvcnRfID0gZXhwb3J0c1tpXTtcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY29tbWVudC5jb250ZXh0O1xuICAgICAgICAgIGZvciAobGV0IGogPSAwOyBjb250ZXh0ICYmIGogPCBjb250ZXh0LmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5jaGlsZHJlbltpXSAmJiBjb250ZXh0LmNoaWxkcmVuW2ldLnR5cGUgPT09IGV4cG9ydF8udHlwZSkge1xuICAgICAgICAgICAgICBtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oZXhwb3J0XyldID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzIHx8IHt9LFxuICAgICAgICAgICAgICAgIGV4cG9ydF8ucHJvcGVydGllc1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tbWVudDtcbiAgICAgIH0pKTtcblxuICAgIC8vIFJlbW92ZWQgdGhlIG1hdGNoZWQgZXhwb3J0c1xuICAgIF8ucmVtb3ZlKGV4cG9ydHMsIHggPT4gbWF0Y2hlZFtnZXRTdGFydExvY2F0aW9uKHgpXSlcblxuICAgIHJldHVybiBbXS5jb25jYXQoY29tbWVudHMpLmNvbmNhdChuYW1lc3BhY2VzKS5jb25jYXQoZXhwb3J0cyk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XG4gICAgaWYgKGlzSmF2YURvY0NvbW1lbnQodGhpcy5zb3VyY2UsIG5vZGUpICYmICFpc0xlZ2FsQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZyhub2RlKTtcbiAgICAgIGlmIChuZXh0U2libGluZykge1xuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENvbnRleHQobmV4dFNpYmxpbmcsIHt9KSwgdHJ1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmlzaXQgdGhlIGNvbnRleHR1YWwgbm9kZVxuICAgKiBcbiAgICogIyBSZW1hcmtcbiAgICogXG4gICAqIEEgbm9kZSBpcyBjb25zaWRlcmVkIGNvbnRleHR1YWwgd2hlbiBhIGNvbW1lbnQgaXMgdmlzaXRlZCBhbmQgdGhlIG5vZGUgaXMgaXRzIHNpYmxpbmcuXG4gICAqL1xuICBwcml2YXRlIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxUeXBlU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnZXhwb3J0X3N0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgICAgY2FzZSAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XG4gICAgICBjYXNlICdjbGFzcyc6XG4gICAgICBjYXNlICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENsYXNzT3JJbnRlcmZhY2Uobm9kZSwgcHJvcGVydGllcylcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIGNhc2UgJ2NhbGxfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ21ldGhvZF9zaWduYXR1cmUnOlxuICAgICAgY2FzZSAncHJvcGVydHlfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ3B1YmxpY19maWVsZF9kZWZpbml0aW9uJzpcbiAgICAgIGNhc2UgJ21ldGhvZF9kZWZpbml0aW9uJzpcbiAgICAgIGNhc2UgJ2xleGljYWxfZGVjbGFyYXRpb24nOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyogU3RhdGVtZW50cyAqL1xuXG4gIHByaXZhdGUgdmlzaXRFeHBvcnRTdGF0ZW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgZGVmYXVsdEV4cG9ydCA9IGZhbHNlO1xuICAgIC8vIFJlbW92ZSAnZXhwb3J0JyBzaW5jZSBpdCdzIGFsd2F5cyBmaXJzdCBpbiB0aGUgYXJyYXlcbiAgICBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIGlmICh0aGlzLmhhc0RlZmF1bHRFeHBvcnQobm9kZSkpIHtcbiAgICAgIGRlZmF1bHRFeHBvcnQgPSB0cnVlO1xuICAgICAgLy8gUmVtb3ZlICdkZWZhdWx0JyBleHBvcnRcbiAgICAgIGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgfVxuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW4uc2hpZnQoKTtcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQsIHsgZXhwb3J0czogeyBleHBvcnQ6IHRydWUsIGRlZmF1bHQ6IGRlZmF1bHRFeHBvcnQgfSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRFeHByZXNzaW9uU3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM6IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG5cbiAgICBpZiAobWF0Y2goY2hpbGQsICdpbnRlcm5hbF9tb2R1bGUnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShjaGlsZCwgcHJvcGVydGllcylcbiAgICB9XG5cbiAgICBpZiAobWF0Y2goY2hpbGQsICdmdW5jdGlvbicpKSB7XG4gICAgICBpZiAocHJvcGVydGllcykgcmV0dXJuIHRoaXMudmlzaXRDb250ZXh0KGNoaWxkLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKGNoaWxkKVxuICB9XG5cbiAgLyogTW9kdWxlcyAqL1xuXG4gIHByaXZhdGUgdmlzaXRJbnRlcm5hbE1vZHVsZSA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxUeXBlU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IG5vZGUuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ3N0YXRlbWVudF9ibG9jaycpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKGNoaWxkLCAnY29tbWVudCcpKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9kZShjaGlsZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIGNoaWxkcmVuLCBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHsgbmFtZXNwYWNlOiB0cnVlIH0pKTtcbiAgfVxuXG5cbiAgLyogRGVjbGFyYXRpb25zICovXG5cbiAgcHJpdmF0ZSB2aXNpdENsYXNzT3JJbnRlcmZhY2UgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgLy8gU2luY2UgJ2ludGVyZmFjZScgb3IgJ2NsYXNzJyBpcyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgLy8gd2UnbGwgbmVlZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXkuXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICBjb25zdCBpbnRlcmZhY2VfID0gY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBsZXQgZXh0ZW5kc18gPSBmYWxzZSwgaW1wbGVtZW50c18gPSBmYWxzZTtcbiAgICBpZiAodGhpcy5oYXNJbmhlcml0YW5jZShub2RlKSkge1xuICAgICAgY29uc3QgaW5oZXJpdGFuY2UgPSB0aGlzLmdldEluaGVyaXRhbmNlVHlwZShub2RlKVxuICAgICAgZXh0ZW5kc18gPSBpbmhlcml0YW5jZSA9PT0gJ2V4dGVuZHMnO1xuICAgICAgaW1wbGVtZW50c18gPSBpbmhlcml0YW5jZSA9PT0gJ2ltcGxlbWVudHMnO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGVfID0gY3JlYXRlQVNUTm9kZShcbiAgICAgIHRoaXMuc291cmNlLFxuICAgICAgbm9kZSxcbiAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksXG4gICAgICBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHtcbiAgICAgICAgaW5oZXJpdGFuY2U6IHtcbiAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzXyxcbiAgICAgICAgICBleHRlbmRzOiBleHRlbmRzX1xuICAgICAgICB9IGFzIFR5cGVTY3JpcHRJbmhlcml0YW5jZVxuICAgICAgfSkpO1xuXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzcycpKSB7XG4gICAgICByZXR1cm4gbm9kZV87XG4gICAgfVxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgbm9kZSB0eXBlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihub2RlXywgeyB0eXBlOiBpbnRlcmZhY2VfLnR5cGUgfSlcbiAgfVxuXG4gIC8qIE5vbi10ZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0Tm9uVGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBzb21lIG5vbi10ZXJtaW5hbHNcbiAgICAvLyBjb250YWluIGNvbW1lbnRzIHdoaWNoIGlzIHdoYXQgd2UgY2FyZSBhYm91dFxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3NfYm9keScsICdvYmplY3RfdHlwZScpKSB7XG4gICAgICBjaGlsZHJlbiA9IHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBleHBvcnQgc3RhdGVtZW50cyBoYXZlIG5vZGUgcHJvcGVydGllc1xuICAgIGlmIChtYXRjaChub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm5hbCBtb2R1bGUgY29udGFpbnMgb3RoZXIgbm9kZXNcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2ludGVybmFsX21vZHVsZScpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKG5vZGUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybWFsX21vZHVsZSBjYW4gZXhpc3QgaW4gYW4gZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICBpZiAobWF0Y2gobm9kZSwgJ2Z1bmN0aW9uJykgfHwgbWF0Y2gobm9kZSwgJ21ldGhvZF9kZWZpbml0aW9uJykpIHtcbiAgICAgIF8ucmVtb3ZlKGNoaWxkcmVuLCBjaGlsZCA9PiBtYXRjaChjaGlsZCwgJ3N0YXRlbWVudF9ibG9jaycpKVxuICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcbiAgfVxuXG4gIC8qIFRlcm1pbmFscyAqL1xuXG4gIHByaXZhdGUgdmlzaXRUZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUpXG4gIH1cbn0iXX0=