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
                    if (match_1.default(node, 'constraint', 'formal_parameters', 'required_parameter', 'rest_parameter', 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type', 'predefined_type', 'parenthesized_type', 'literal_type', 'intersection_type', 'union_type', 'class_body', 'extends_clause', 'unary_expression', 'binary_expression', 'statement_block', 'return_statement', 'export_statement', 'expression_statement', 
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
                    for (let j = 0; j < context.children.length; j++) {
                        if (context.children[i].type === export_.type) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUN2RCxpREFBdUQ7QUFHdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBR3RDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUFvQyxFQUNwQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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LE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksZUFBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDdEIsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN0QjtTQUNGO1FBQ0QsZ0NBQWdDO1FBQ2hDLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0FrUUY7QUF0VUQsOENBc1VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQVNUTm9kZSwgQVNUTm9kZSB9IGZyb20gXCIuLi9jb21tb24vYXN0XCI7XHJcbmltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29tbWVudFwiO1xyXG5pbXBvcnQgeyBOb2RlUHJvcGVydGllcywgTm9kZUluaGVyaXRhbmNlIH0gZnJvbSBcIi4uL2NvbW1vbi9lbWNhXCI7XHJcbmltcG9ydCB7IE5vZGVWaXNpdG9yIH0gZnJvbSBcIi4uL2NvbW1vbi9ub2RlXCI7XHJcbmltcG9ydCB7IHNpYmxpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2libGluZ1wiO1xyXG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbG9nXCI7XHJcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vdXRpbHMvbWF0Y2hcIjtcclxuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGNsYXNzIHRoYXQgdmlzaXRzIEFTVE5vZGVzIGZyb20gYSBUeXBlU2NyaXB0IHRyZWUuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHlwZVNjcmlwdFZpc2l0b3IgaW1wbGVtZW50cyBOb2RlVmlzaXRvciB7XHJcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXHJcbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZVxyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaGFzIGluaGVyaXRhbmNlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XHJcbiAgICBsZXQgaW5oZXJpdHMgPSBmYWxzZTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnLCAnaW1wbGVtZW50cycpKSB7XHJcbiAgICAgICAgaW5oZXJpdHMgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5oZXJpdHNcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnKSkge1xyXG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xyXG4gICAgICAgIHJldHVybiAnaW1wbGVtZW50cyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhbiBleHBvcnQgaXMgZGVmYXVsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBvbmx5IHRoZSBjb21tZW50cyBmcm9tIGEgbm9kZSdzIGNoaWxkcmVuLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZmlsdGVyVHlwZShub2RlOiBTeW50YXhOb2RlLCB0eXBlOiBzdHJpbmcpOiBTeW50YXhOb2RlW10ge1xyXG4gICAgLy8gY29uc29sZS50aW1lKCdmaWx0ZXJUeXBlJylcclxuICAgIGxldCBjaGlsZHJlbjogU3ludGF4Tm9kZVtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsIHR5cGUpKSB7XHJcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUudGltZUVuZCgnZmlsdGVyVHlwZScpXHJcbiAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICBnZXRBU1QoKTogQVNUTm9kZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmFzdDtcclxuICB9XHJcblxyXG4gIC8qIFZpc2l0b3JzICAqL1xyXG5cclxuICB2aXNpdE5vZGUgPSAoXHJcbiAgICBub2RlOiBTeW50YXhOb2RlLFxyXG4gICAgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+XHJcbiAgKSA9PiB7XHJcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xyXG4gICAgICBjYXNlICdwcm9ncmFtJzpcclxuICAgICAgICB0aGlzLmFzdCA9IHRoaXMudmlzaXRQcm9ncmFtKG5vZGUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjb21tZW50JzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbW1lbnQobm9kZSk7XHJcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxyXG4gICAgICBjYXNlICdFUlJPUic6XHJcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuXHJcbiAgICAgICAgLyogTWF0Y2ggb3RoZXIgbm9uLXRlcm1pbmFscyAqL1xyXG5cclxuICAgICAgICBpZiAobWF0Y2gobm9kZSxcclxuICAgICAgICAgICdjb25zdHJhaW50JyxcclxuICAgICAgICAgICdmb3JtYWxfcGFyYW1ldGVycycsICdyZXF1aXJlZF9wYXJhbWV0ZXInLCAncmVzdF9wYXJhbWV0ZXInLFxyXG4gICAgICAgICAgJ3R5cGVfaWRlbnRpZmllcicsICd0eXBlX3BhcmFtZXRlcnMnLCAndHlwZV9wYXJhbWV0ZXInLCAndHlwZV9hbm5vdGF0aW9uJyxcclxuICAgICAgICAgICdvYmplY3RfdHlwZScsICdwcmVkZWZpbmVkX3R5cGUnLCAncGFyZW50aGVzaXplZF90eXBlJywgJ2xpdGVyYWxfdHlwZScsXHJcbiAgICAgICAgICAnaW50ZXJzZWN0aW9uX3R5cGUnLCAndW5pb25fdHlwZScsXHJcbiAgICAgICAgICAnY2xhc3NfYm9keScsXHJcbiAgICAgICAgICAnZXh0ZW5kc19jbGF1c2UnLFxyXG4gICAgICAgICAgJ3VuYXJ5X2V4cHJlc3Npb24nLCAnYmluYXJ5X2V4cHJlc3Npb24nLFxyXG4gICAgICAgICAgJ3N0YXRlbWVudF9ibG9jaycsICdyZXR1cm5fc3RhdGVtZW50JywgJ2V4cG9ydF9zdGF0ZW1lbnQnLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnLFxyXG4gICAgICAgICAgLy8gQSBjYWxsX3NpZ25hdHVyZSBjYW4gYWxzbyBiZSBhIG5vbi1jb250ZXh0dWFsIG5vZGVcclxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXHJcbiAgICAgICAgICAnaW50ZXJuYWxfbW9kdWxlJ1xyXG4gICAgICAgICkpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSwgcHJvcGVydGllcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIE1hdGNoIHRlcm1pbmFscyAqL1xyXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxyXG4gICAgICAgICAgJ2lkZW50aWZpZXInLCAnZXh0ZW5kcycsICdwcm9wZXJ0eV9pZGVudGlmaWVyJywgJ2FjY2Vzc2liaWxpdHlfbW9kaWZpZXInLFxyXG4gICAgICAgICAgJ3N0cmluZycsICd2b2lkJywgJ2Jvb2xlYW4nLCAnbnVsbCcsICd1bmRlZmluZWQnLCAnbnVtYmVyJywgJ3JldHVybicsXHJcbiAgICAgICAgICAnZ2V0JywgJ2Z1bmN0aW9uJywgJ25hbWVzcGFjZSdcclxuICAgICAgICApKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFRlcm1pbmFsKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmlzaXRDaGlsZHJlbiA9IChub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdID0+IHtcclxuICAgIGxldCBjaGlsZHJlbjogQVNUTm9kZVtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgaWYgKCFub2RlLnR5cGUubWF0Y2goL1s8Pigpe30sOjtcXFtcXF0mfD1cXCtcXC1cXCpcXC9dLykgJiYgbm9kZS50eXBlICE9PSAnLi4uJykge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy52aXNpdE5vZGUobm9kZSk7XHJcbiAgICAgICAgaWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNoaWxkcmVuO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdFByb2dyYW0gPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGVbXSA9PiB7XHJcbiAgICBsZXQgdmlzaXRlZCA9IHt9LFxyXG4gICAgICBnZXRTdGFydExvY2F0aW9uID0gKG46IEFTVE5vZGUpID0+IGAke24ubG9jYXRpb24ucm93LnN0YXJ0fToke24ubG9jYXRpb24uY29sdW1uLnN0YXJ0fWA7XHJcbiAgICAvLyBBIHByb2dyYW0gY2FuIGhhdmUgbW9kdWxlcywgbmFtZXNwYWNlcywgY29tbWVudHMgYXMgaXRzIGNoaWxkcmVuXHJcbiAgICAvLyBUaGUgZmlyc3Qgc3RlcCBpcyB0byBwYXJzZSBhbGwgdGhlIGNvbW1lbnRzIGluIHRoZSByb290IG5vZGVcclxuICAgIGxldCBjb21tZW50cyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2NvbW1lbnQnKSk7XHJcbiAgICAvLyBQYXJzZSB0aGUgbmFtZXNwYWNlcyBpbiBleHByZXNzaW9uX3N0YXRlbWVudFxyXG4gICAgbGV0IG5hbWVzcGFjZXMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKTtcclxuICAgIC8vIFBhcnNlIHRoZSBleHBvcnQgc3RhdGVtZW50cyBpbiB0aGUgcm9vdCBub2RlXHJcbiAgICBsZXQgZXhwb3J0cyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSk7XHJcblxyXG4gICAgLy8gR2V0IHRoZSB2aXNpdGVkIGNvbnRleHQgbm9kZXNcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY29tbWVudCA9IGNvbW1lbnRzW2ldO1xyXG4gICAgICBjb25zdCBjb250ZXh0ID0gY29tbWVudDtcclxuICAgICAgdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKGNvbnRleHQpXSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRoZSB2aXNpdGVkIG5vZGVzIGZyb20gbmFtZXNwYWNlcyBhcnJheVxyXG4gICAgXy5yZW1vdmUobmFtZXNwYWNlcywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcclxuXHJcbiAgICAvLyBFeHBvcnRzIGFyZSBvZGRiYWxscyBzaW5jZSBzb21lIGV4cG9ydHMgbWF5IHJlZmVyZW5jZVxyXG4gICAgLy8gYSB0eXBlL25vZGUgdGhhdCBtYXkgaGF2ZSBiZWVuIGNvbW1lbnRlZC5cclxuICAgIC8vIFdlJ2xsIGZpcnN0IG5lZWQgdG8gZmlsdGVyIHRoZSBvbmVzIHdlIGhhdmUgdmlzaXRlZFxyXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcclxuXHJcbiAgICAvLyBGcm9tIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQsIHdlJ2xsIG5lZWQgdG8gbW9kaWZ5XHJcbiAgICAvLyB0aGUgbm9kZSBwcm9wZXJ0aWVzIG9mIGVhY2ggY29udGV4dCBpbiBhIGNvbW1lbnQgbm9kZSB0aGF0XHJcbiAgICAvLyBtYXRjaGVzIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQuXHJcbiAgICBjb25zdCBtYXRjaGVkID0ge307XHJcbiAgICBjb21tZW50cyA9IF8uY29tcGFjdChcclxuICAgICAgY29tbWVudHMubWFwKGNvbW1lbnQgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwb3J0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgY29uc3QgZXhwb3J0XyA9IGV4cG9ydHNbaV07XHJcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY29tbWVudC5jb250ZXh0O1xyXG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjb250ZXh0LmNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmNoaWxkcmVuW2ldLnR5cGUgPT09IGV4cG9ydF8udHlwZSkge1xyXG4gICAgICAgICAgICAgIG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbihleHBvcnRfKV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihcclxuICAgICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzIHx8IHt9LFxyXG4gICAgICAgICAgICAgICAgZXhwb3J0Xy5wcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29tbWVudDtcclxuICAgICAgfSkpO1xyXG5cclxuICAgIC8vIFJlbW92ZWQgdGhlIG1hdGNoZWQgZXhwb3J0c1xyXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiBtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKVxyXG5cclxuICAgIHJldHVybiBbXS5jb25jYXQoY29tbWVudHMpLmNvbmNhdChuYW1lc3BhY2VzKS5jb25jYXQoZXhwb3J0cyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkpIHtcclxuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nKG5vZGUpO1xyXG4gICAgICBpZiAobmV4dFNpYmxpbmcpIHtcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENvbnRleHQobmV4dFNpYmxpbmcsIHt9KSwgdHJ1ZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmlzaXQgdGhlIGNvbnRleHR1YWwgbm9kZVxyXG4gICAqIFxyXG4gICAqICMgUmVtYXJrXHJcbiAgICogXHJcbiAgICogQSBub2RlIGlzIGNvbnNpZGVyZWQgY29udGV4dHVhbCB3aGVuIGEgY29tbWVudCBpcyB2aXNpdGVkIGFuZCB0aGUgbm9kZSBpcyBpdHMgc2libGluZy5cclxuICAgKi9cclxuICBwcml2YXRlIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ2V4cG9ydF9zdGF0ZW1lbnQnOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICBjYXNlICdleHByZXNzaW9uX3N0YXRlbWVudCc6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICBjYXNlICdjbGFzcyc6XHJcbiAgICAgIGNhc2UgJ2ludGVyZmFjZV9kZWNsYXJhdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDbGFzc09ySW50ZXJmYWNlKG5vZGUsIHByb3BlcnRpZXMpXHJcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcclxuICAgICAgY2FzZSAnY2FsbF9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdtZXRob2Rfc2lnbmF0dXJlJzpcclxuICAgICAgY2FzZSAncHJvcGVydHlfc2lnbmF0dXJlJzpcclxuICAgICAgY2FzZSAncHVibGljX2ZpZWxkX2RlZmluaXRpb24nOlxyXG4gICAgICBjYXNlICdtZXRob2RfZGVmaW5pdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyogU3RhdGVtZW50cyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgZGVmYXVsdEV4cG9ydCA9IGZhbHNlO1xyXG4gICAgLy8gUmVtb3ZlICdleHBvcnQnIHNpbmNlIGl0J3MgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxyXG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcclxuICAgIGlmICh0aGlzLmhhc0RlZmF1bHRFeHBvcnQobm9kZSkpIHtcclxuICAgICAgZGVmYXVsdEV4cG9ydCA9IHRydWU7XHJcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XHJcbiAgICAgIGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQsIHsgZXhwb3J0czogeyBleHBvcnQ6IHRydWUsIGRlZmF1bHQ6IGRlZmF1bHRFeHBvcnQgfSB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmlzaXRFeHByZXNzaW9uU3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM6IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xyXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShjaGlsZCwgcHJvcGVydGllcylcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSk7XHJcbiAgfVxyXG5cclxuICAvKiBNb2R1bGVzICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXRJbnRlcm5hbE1vZHVsZSA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIGxldCBjaGlsZHJlbjogQVNUTm9kZVtdID0gbm9kZS5jaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSkge1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKGNoaWxkLCAnY29tbWVudCcpKSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgY2hpbGRyZW4sIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcyB8fCB7fSwgeyBuYW1lc3BhY2U6IHRydWUgfSkpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qIERlY2xhcmF0aW9ucyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0Q2xhc3NPckludGVyZmFjZSA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIC8vIFNpbmNlICdpbnRlcmZhY2UnIG9yICdjbGFzcycgaXMgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxyXG4gICAgLy8gd2UnbGwgbmVlZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXkuXHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgY29uc3QgaW50ZXJmYWNlXyA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICBsZXQgZXh0ZW5kc18gPSBmYWxzZSwgaW1wbGVtZW50c18gPSBmYWxzZTtcclxuICAgIGlmICh0aGlzLmhhc0luaGVyaXRhbmNlKG5vZGUpKSB7XHJcbiAgICAgIGNvbnN0IGluaGVyaXRhbmNlID0gdGhpcy5nZXRJbmhlcml0YW5jZVR5cGUobm9kZSlcclxuICAgICAgZXh0ZW5kc18gPSBpbmhlcml0YW5jZSA9PT0gJ2V4dGVuZHMnO1xyXG4gICAgICBpbXBsZW1lbnRzXyA9IGluaGVyaXRhbmNlID09PSAnaW1wbGVtZW50cyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9kZV8gPSBjcmVhdGVBU1ROb2RlKFxyXG4gICAgICB0aGlzLnNvdXJjZSxcclxuICAgICAgbm9kZSxcclxuICAgICAgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSxcclxuICAgICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7XHJcbiAgICAgICAgaW5oZXJpdGFuY2U6IHtcclxuICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNfLFxyXG4gICAgICAgICAgZXh0ZW5kczogZXh0ZW5kc19cclxuICAgICAgICB9IGFzIE5vZGVJbmhlcml0YW5jZVxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzcycpKSB7XHJcbiAgICAgIHJldHVybiBub2RlXztcclxuICAgIH1cclxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgbm9kZSB0eXBlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5vZGVfLCB7IHR5cGU6IGludGVyZmFjZV8udHlwZSB9KVxyXG4gIH1cclxuXHJcbiAgLyogTm9uLXRlcm1pbmFscyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0Tm9uVGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgc29tZSBub24tdGVybWluYWxzXHJcbiAgICAvLyBjb250YWluIGNvbW1lbnRzIHdoaWNoIGlzIHdoYXQgd2UgY2FyZSBhYm91dFxyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzc19ib2R5JywgJ29iamVjdF90eXBlJykpIHtcclxuICAgICAgY2hpbGRyZW4gPSB0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2NvbW1lbnQnKTtcclxuICAgIH1cclxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGV4cG9ydCBzdGF0ZW1lbnRzIGhhdmUgbm9kZSBwcm9wZXJ0aWVzXHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm5hbCBtb2R1bGUgY29udGFpbnMgb3RoZXIgbm9kZXNcclxuICAgIGlmIChtYXRjaChub2RlLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm1hbF9tb2R1bGUgY2FuIGV4aXN0IGluIGFuIGV4cHJlc3Npb25fc3RhdGVtZW50XHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XHJcbiAgfVxyXG5cclxuICAvKiBUZXJtaW5hbHMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdFRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxyXG4gIH1cclxufSJdfQ==