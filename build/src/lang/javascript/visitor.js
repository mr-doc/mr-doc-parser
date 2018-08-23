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
class JavaScriptVisitor {
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
exports.JavaScriptVisitor = JavaScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2phdmFzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUN2RCxpREFBdUQ7QUFHdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBR3RDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUFvQyxFQUNwQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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LENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0ErUEY7QUFuVUQsOENBbVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQVNUTm9kZSwgQVNUTm9kZSB9IGZyb20gXCIuLi9jb21tb24vYXN0XCI7XHJcbmltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29tbWVudFwiO1xyXG5pbXBvcnQgeyBOb2RlUHJvcGVydGllcywgTm9kZUluaGVyaXRhbmNlIH0gZnJvbSBcIi4uL2NvbW1vbi9lbWNhXCI7XHJcbmltcG9ydCB7IE5vZGVWaXNpdG9yIH0gZnJvbSBcIi4uL2NvbW1vbi9ub2RlXCI7XHJcbmltcG9ydCB7IHNpYmxpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2libGluZ1wiO1xyXG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbG9nXCI7XHJcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vdXRpbHMvbWF0Y2hcIjtcclxuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGNsYXNzIHRoYXQgdmlzaXRzIEFTVE5vZGVzIGZyb20gYSBUeXBlU2NyaXB0IHRyZWUuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgSmF2YVNjcmlwdFZpc2l0b3IgaW1wbGVtZW50cyBOb2RlVmlzaXRvciB7XHJcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXHJcbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZVxyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaGFzIGluaGVyaXRhbmNlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XHJcbiAgICBsZXQgaW5oZXJpdHMgPSBmYWxzZTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnLCAnaW1wbGVtZW50cycpKSB7XHJcbiAgICAgICAgaW5oZXJpdHMgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5oZXJpdHNcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnKSkge1xyXG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xyXG4gICAgICAgIHJldHVybiAnaW1wbGVtZW50cyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhbiBleHBvcnQgaXMgZGVmYXVsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBvbmx5IHRoZSBjb21tZW50cyBmcm9tIGEgbm9kZSdzIGNoaWxkcmVuLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZmlsdGVyVHlwZShub2RlOiBTeW50YXhOb2RlLCB0eXBlOiBzdHJpbmcpOiBTeW50YXhOb2RlW10ge1xyXG4gICAgLy8gY29uc29sZS50aW1lKCdmaWx0ZXJUeXBlJylcclxuICAgIGxldCBjaGlsZHJlbjogU3ludGF4Tm9kZVtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsIHR5cGUpKSB7XHJcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUudGltZUVuZCgnZmlsdGVyVHlwZScpXHJcbiAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICBnZXRBU1QoKTogQVNUTm9kZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmFzdDtcclxuICB9XHJcblxyXG4gIC8qIFZpc2l0b3JzICAqL1xyXG5cclxuICB2aXNpdE5vZGUgPSAoXHJcbiAgICBub2RlOiBTeW50YXhOb2RlLFxyXG4gICAgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+XHJcbiAgKSA9PiB7XHJcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xyXG4gICAgICBjYXNlICdwcm9ncmFtJzpcclxuICAgICAgICB0aGlzLmFzdCA9IHRoaXMudmlzaXRQcm9ncmFtKG5vZGUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjb21tZW50JzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbW1lbnQobm9kZSk7XHJcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxyXG4gICAgICBjYXNlICdFUlJPUic6XHJcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuXHJcbiAgICAgICAgLyogTWF0Y2ggb3RoZXIgbm9uLXRlcm1pbmFscyAqL1xyXG5cclxuICAgICAgICBpZiAobWF0Y2gobm9kZSxcclxuICAgICAgICAgICdjb25zdHJhaW50JyxcclxuICAgICAgICAgICdmb3JtYWxfcGFyYW1ldGVycycsICdyZXF1aXJlZF9wYXJhbWV0ZXInLCAncmVzdF9wYXJhbWV0ZXInLFxyXG4gICAgICAgICAgJ3R5cGVfaWRlbnRpZmllcicsICd0eXBlX3BhcmFtZXRlcnMnLCAndHlwZV9wYXJhbWV0ZXInLCAndHlwZV9hbm5vdGF0aW9uJyxcclxuICAgICAgICAgICdvYmplY3RfdHlwZScsICdwcmVkZWZpbmVkX3R5cGUnLCAncGFyZW50aGVzaXplZF90eXBlJywgJ2xpdGVyYWxfdHlwZScsXHJcbiAgICAgICAgICAnaW50ZXJzZWN0aW9uX3R5cGUnLCAndW5pb25fdHlwZScsXHJcbiAgICAgICAgICAnY2xhc3NfYm9keScsXHJcbiAgICAgICAgICAnZXh0ZW5kc19jbGF1c2UnLFxyXG4gICAgICAgICAgJ3VuYXJ5X2V4cHJlc3Npb24nLCAnYmluYXJ5X2V4cHJlc3Npb24nLFxyXG4gICAgICAgICAgJ3N0YXRlbWVudF9ibG9jaycsICdyZXR1cm5fc3RhdGVtZW50JywgJ2V4cG9ydF9zdGF0ZW1lbnQnLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnLFxyXG4gICAgICAgICAgLy8gQSBjYWxsX3NpZ25hdHVyZSBjYW4gYWxzbyBiZSBhIG5vbi1jb250ZXh0dWFsIG5vZGVcclxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXHJcbiAgICAgICAgICAnaW50ZXJuYWxfbW9kdWxlJ1xyXG4gICAgICAgICkpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSwgcHJvcGVydGllcylcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIE1hdGNoIHRlcm1pbmFscyAqL1xyXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxyXG4gICAgICAgICAgJ2lkZW50aWZpZXInLCAnZXh0ZW5kcycsICdwcm9wZXJ0eV9pZGVudGlmaWVyJywgJ2FjY2Vzc2liaWxpdHlfbW9kaWZpZXInLFxyXG4gICAgICAgICAgJ3N0cmluZycsICd2b2lkJywgJ2Jvb2xlYW4nLCAnbnVsbCcsICd1bmRlZmluZWQnLCAnbnVtYmVyJywgJ3JldHVybicsXHJcbiAgICAgICAgICAnZ2V0JywgJ2Z1bmN0aW9uJywgJ25hbWVzcGFjZScsXHJcbiAgICAgICAgKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUZXJtaW5hbChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZpc2l0Q2hpbGRyZW4gPSAobm9kZXM6IFN5bnRheE5vZGVbXSk6IEFTVE5vZGVbXSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XHJcbiAgICAgIGlmICghbm9kZS50eXBlLm1hdGNoKC9bPD4oKXt9LDo7XFxbXFxdJnw9XFwrXFwtXFwqXFwvXS8pICYmIG5vZGUudHlwZSAhPT0gJy4uLicpIHtcclxuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMudmlzaXROb2RlKG5vZGUpO1xyXG4gICAgICAgIGlmIChjaGlsZCkgY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjaGlsZHJlbjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmlzaXRQcm9ncmFtID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlW10gPT4ge1xyXG4gICAgbGV0IHZpc2l0ZWQgPSB7fSxcclxuICAgICAgZ2V0U3RhcnRMb2NhdGlvbiA9IChuOiBBU1ROb2RlKSA9PiBgJHtuLmxvY2F0aW9uLnJvdy5zdGFydH06JHtuLmxvY2F0aW9uLmNvbHVtbi5zdGFydH1gO1xyXG4gICAgLy8gQSBwcm9ncmFtIGNhbiBoYXZlIG1vZHVsZXMsIG5hbWVzcGFjZXMsIGNvbW1lbnRzIGFzIGl0cyBjaGlsZHJlblxyXG4gICAgLy8gVGhlIGZpcnN0IHN0ZXAgaXMgdG8gcGFyc2UgYWxsIHRoZSBjb21tZW50cyBpbiB0aGUgcm9vdCBub2RlXHJcbiAgICBsZXQgY29tbWVudHMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50JykpO1xyXG4gICAgLy8gUGFyc2UgdGhlIG5hbWVzcGFjZXMgaW4gZXhwcmVzc2lvbl9zdGF0ZW1lbnRcclxuICAgIC8vIGxldCBuYW1lc3BhY2VzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSk7XHJcbiAgICAvLyBQYXJzZSB0aGUgZXhwb3J0IHN0YXRlbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxyXG4gICAgbGV0IGV4cG9ydHMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdleHBvcnRfc3RhdGVtZW50JykpO1xyXG5cclxuICAgIC8vIEdldCB0aGUgdmlzaXRlZCBjb250ZXh0IG5vZGVzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1tpXTtcclxuICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQ7XHJcbiAgICAgIHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbihjb250ZXh0KV0gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEV4cG9ydHMgYXJlIG9kZGJhbGxzIHNpbmNlIHNvbWUgZXhwb3J0cyBtYXkgcmVmZXJlbmNlXHJcbiAgICAvLyBhIHR5cGUvbm9kZSB0aGF0IG1heSBoYXZlIGJlZW4gY29tbWVudGVkLlxyXG4gICAgLy8gV2UnbGwgZmlyc3QgbmVlZCB0byBmaWx0ZXIgdGhlIG9uZXMgd2UgaGF2ZSB2aXNpdGVkXHJcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pO1xyXG5cclxuICAgIC8vIEZyb20gdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZCwgd2UnbGwgbmVlZCB0byBtb2RpZnlcclxuICAgIC8vIHRoZSBub2RlIHByb3BlcnRpZXMgb2YgZWFjaCBjb250ZXh0IGluIGEgY29tbWVudCBub2RlIHRoYXRcclxuICAgIC8vIG1hdGNoZXMgdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZC5cclxuICAgIGNvbnN0IG1hdGNoZWQgPSB7fTtcclxuICAgIGNvbW1lbnRzID0gXy5jb21wYWN0KFxyXG4gICAgICBjb21tZW50cy5tYXAoY29tbWVudCA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBvcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBjb25zdCBleHBvcnRfID0gZXhwb3J0c1tpXTtcclxuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50LmNvbnRleHQ7XHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNvbnRleHQuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGNvbnRleHQuY2hpbGRyZW5baV0udHlwZSA9PT0gZXhwb3J0Xy50eXBlKSB7XHJcbiAgICAgICAgICAgICAgbWF0Y2hlZFtnZXRTdGFydExvY2F0aW9uKGV4cG9ydF8pXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKFxyXG4gICAgICAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnByb3BlcnRpZXMgfHwge30sXHJcbiAgICAgICAgICAgICAgICBleHBvcnRfLnByb3BlcnRpZXNcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb21tZW50O1xyXG4gICAgICB9KSk7XHJcblxyXG4gICAgLy8gUmVtb3ZlZCB0aGUgbWF0Y2hlZCBleHBvcnRzXHJcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pXHJcblxyXG4gICAgcmV0dXJuIFtdLmNvbmNhdChjb21tZW50cykuY29uY2F0KGV4cG9ydHMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdENvbW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xyXG4gICAgaWYgKGlzSmF2YURvY0NvbW1lbnQodGhpcy5zb3VyY2UsIG5vZGUpKSB7XHJcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZyhub2RlKTtcclxuICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDb250ZXh0KG5leHRTaWJsaW5nLCB7fSksIHRydWUpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFZpc2l0IHRoZSBjb250ZXh0dWFsIG5vZGVcclxuICAgKiBcclxuICAgKiAjIFJlbWFya1xyXG4gICAqIFxyXG4gICAqIEEgbm9kZSBpcyBjb25zaWRlcmVkIGNvbnRleHR1YWwgd2hlbiBhIGNvbW1lbnQgaXMgdmlzaXRlZCBhbmQgdGhlIG5vZGUgaXMgaXRzIHNpYmxpbmcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB2aXNpdENvbnRleHQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xyXG4gICAgICBjYXNlICdleHBvcnRfc3RhdGVtZW50JzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgY2FzZSAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgY2FzZSAnY2xhc3MnOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q2xhc3Mobm9kZSwgcHJvcGVydGllcylcclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxyXG4gICAgICBjYXNlICdjYWxsX3NpZ25hdHVyZSc6XHJcbiAgICAgIGNhc2UgJ21ldGhvZF9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdwcm9wZXJ0eV9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdwdWJsaWNfZmllbGRfZGVmaW5pdGlvbic6XHJcbiAgICAgIGNhc2UgJ21ldGhvZF9kZWZpbml0aW9uJzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiBTdGF0ZW1lbnRzICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXRFeHBvcnRTdGF0ZW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLCBkZWZhdWx0RXhwb3J0ID0gZmFsc2U7XHJcbiAgICAvLyBSZW1vdmUgJ2V4cG9ydCcgc2luY2UgaXQncyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XHJcbiAgICBjaGlsZHJlbi5zaGlmdCgpO1xyXG4gICAgaWYgKHRoaXMuaGFzRGVmYXVsdEV4cG9ydChub2RlKSkge1xyXG4gICAgICBkZWZhdWx0RXhwb3J0ID0gdHJ1ZTtcclxuICAgICAgLy8gUmVtb3ZlICdkZWZhdWx0JyBleHBvcnRcclxuICAgICAgY2hpbGRyZW4uc2hpZnQoKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW4uc2hpZnQoKTtcclxuICAgIHJldHVybiB0aGlzLnZpc2l0Tm9kZShjaGlsZCwgeyBleHBvcnRzOiB7IGV4cG9ydDogdHJ1ZSwgZGVmYXVsdDogZGVmYXVsdEV4cG9ydCB9IH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllczogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XHJcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICBpZiAobWF0Y2goY2hpbGQsICdpbnRlcm5hbF9tb2R1bGUnKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKGNoaWxkLCBwcm9wZXJ0aWVzKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlKTtcclxuICB9XHJcblxyXG4gIC8qIE1vZHVsZXMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdEludGVybmFsTW9kdWxlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ3N0YXRlbWVudF9ibG9jaycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUoY2hpbGQsICdjb21tZW50JykpKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9kZShjaGlsZCk7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCBjaGlsZHJlbiwgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7IG5hbWVzcGFjZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyogRGVjbGFyYXRpb25zICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXRDbGFzcyA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIC8vIFNpbmNlICdpbnRlcmZhY2UnIG9yICdjbGFzcycgaXMgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxyXG4gICAgLy8gd2UnbGwgbmVlZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXkuXHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgY29uc3QgaW50ZXJmYWNlXyA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICBsZXQgZXh0ZW5kc18gPSBmYWxzZSwgaW1wbGVtZW50c18gPSBmYWxzZTtcclxuICAgIGlmICh0aGlzLmhhc0luaGVyaXRhbmNlKG5vZGUpKSB7XHJcbiAgICAgIGNvbnN0IGluaGVyaXRhbmNlID0gdGhpcy5nZXRJbmhlcml0YW5jZVR5cGUobm9kZSlcclxuICAgICAgZXh0ZW5kc18gPSBpbmhlcml0YW5jZSA9PT0gJ2V4dGVuZHMnO1xyXG4gICAgICBpbXBsZW1lbnRzXyA9IGluaGVyaXRhbmNlID09PSAnaW1wbGVtZW50cyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9kZV8gPSBjcmVhdGVBU1ROb2RlKFxyXG4gICAgICB0aGlzLnNvdXJjZSxcclxuICAgICAgbm9kZSxcclxuICAgICAgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSxcclxuICAgICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7XHJcbiAgICAgICAgaW5oZXJpdGFuY2U6IHtcclxuICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNfLFxyXG4gICAgICAgICAgZXh0ZW5kczogZXh0ZW5kc19cclxuICAgICAgICB9IGFzIE5vZGVJbmhlcml0YW5jZVxyXG4gICAgICB9KSk7XHJcblxyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzcycpKSB7XHJcbiAgICAgIHJldHVybiBub2RlXztcclxuICAgIH1cclxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgbm9kZSB0eXBlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5vZGVfLCB7IHR5cGU6IGludGVyZmFjZV8udHlwZSB9KVxyXG4gIH1cclxuXHJcbiAgLyogTm9uLXRlcm1pbmFscyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0Tm9uVGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgc29tZSBub24tdGVybWluYWxzXHJcbiAgICAvLyBjb250YWluIGNvbW1lbnRzIHdoaWNoIGlzIHdoYXQgd2UgY2FyZSBhYm91dFxyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzc19ib2R5JywgJ29iamVjdF90eXBlJykpIHtcclxuICAgICAgY2hpbGRyZW4gPSB0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2NvbW1lbnQnKTtcclxuICAgIH1cclxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGV4cG9ydCBzdGF0ZW1lbnRzIGhhdmUgbm9kZSBwcm9wZXJ0aWVzXHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm5hbCBtb2R1bGUgY29udGFpbnMgb3RoZXIgbm9kZXNcclxuICAgIGlmIChtYXRjaChub2RlLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm1hbF9tb2R1bGUgY2FuIGV4aXN0IGluIGFuIGV4cHJlc3Npb25fc3RhdGVtZW50XHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XHJcbiAgfVxyXG5cclxuICAvKiBUZXJtaW5hbHMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdFRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxyXG4gIH1cclxufSJdfQ==