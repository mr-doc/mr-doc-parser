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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUF1RTtBQUN2RSxpREFBOEM7QUFFOUMsNEJBQTRCO0FBQzVCLHlDQUFpRDtBQUNqRCw2Q0FBc0M7QUFJdEMsdUNBQThDO0FBRzlDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUEwQyxFQUMxQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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IGZyb20gXCIuLi8uLi91dGlscy9jb21tZW50XCI7XHJcbmltcG9ydCB7IHNpYmxpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2libGluZ1wiO1xyXG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbG9nXCI7XHJcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vdXRpbHMvbWF0Y2hcIjtcclxuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcclxuaW1wb3J0IFZpc2l0b3IgZnJvbSBcIi4uL2NvbW1vbi92aXNpdG9yXCI7XHJcbmltcG9ydCBBU1ROb2RlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL0FTVE5vZGVcIjtcclxuaW1wb3J0IHsgY3JlYXRlQVNUTm9kZSB9IGZyb20gXCIuLi9jb21tb24vYXN0XCI7XHJcbmltcG9ydCB7IFR5cGVTY3JpcHRQcm9wZXJ0aWVzLCBUeXBlU2NyaXB0SW5oZXJpdGFuY2UgfSBmcm9tIFwiLi9wcm9wZXJ0aWVzXCI7XHJcblxyXG4vKipcclxuICogQSBjbGFzcyB0aGF0IHZpc2l0cyBBU1ROb2RlcyBmcm9tIGEgVHlwZVNjcmlwdCB0cmVlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRWaXNpdG9yIGltcGxlbWVudHMgVmlzaXRvciB7XHJcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXHJcbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZVxyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaGFzIGluaGVyaXRhbmNlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XHJcbiAgICBsZXQgaW5oZXJpdHMgPSBmYWxzZTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnLCAnaW1wbGVtZW50cycpKSB7XHJcbiAgICAgICAgaW5oZXJpdHMgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaW5oZXJpdHNcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGRyZW5baV07XHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnKSkge1xyXG4gICAgICAgIHJldHVybiAnZXh0ZW5kcyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2ltcGxlbWVudHMnKSkge1xyXG4gICAgICAgIHJldHVybiAnaW1wbGVtZW50cyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhbiBleHBvcnQgaXMgZGVmYXVsdFxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFzRGVmYXVsdEV4cG9ydChub2RlOiBTeW50YXhOb2RlKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdkZWZhdWx0JykpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBvbmx5IHRoZSBjb21tZW50cyBmcm9tIGEgbm9kZSdzIGNoaWxkcmVuLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZmlsdGVyVHlwZShub2RlOiBTeW50YXhOb2RlLCB0eXBlOiBzdHJpbmcpOiBTeW50YXhOb2RlW10ge1xyXG4gICAgLy8gY29uc29sZS50aW1lKCdmaWx0ZXJUeXBlJylcclxuICAgIGxldCBjaGlsZHJlbjogU3ludGF4Tm9kZVtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsIHR5cGUpKSB7XHJcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGNvbnNvbGUudGltZUVuZCgnZmlsdGVyVHlwZScpXHJcbiAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICBnZXRBU1QoKTogQVNUTm9kZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmFzdDtcclxuICB9XHJcblxyXG4gIC8qIFZpc2l0b3JzICAqL1xyXG5cclxuICB2aXNpdE5vZGUgPSAoXHJcbiAgICBub2RlOiBTeW50YXhOb2RlLFxyXG4gICAgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+XHJcbiAgKSA9PiB7XHJcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xyXG4gICAgICBjYXNlICdwcm9ncmFtJzpcclxuICAgICAgICB0aGlzLmFzdCA9IHRoaXMudmlzaXRQcm9ncmFtKG5vZGUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjb21tZW50JzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbW1lbnQobm9kZSk7XHJcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxyXG4gICAgICBjYXNlICdFUlJPUic6XHJcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuXHJcbiAgICAgICAgLyogTWF0Y2ggb3RoZXIgbm9uLXRlcm1pbmFscyAqL1xyXG5cclxuICAgICAgICBpZiAobWF0Y2gobm9kZSxcclxuICAgICAgICAgICdjb25zdHJhaW50JyxcclxuICAgICAgICAgICdmb3JtYWxfcGFyYW1ldGVycycsICdyZXF1aXJlZF9wYXJhbWV0ZXInLCAncmVzdF9wYXJhbWV0ZXInLFxyXG4gICAgICAgICAgJ3R5cGVfaWRlbnRpZmllcicsICd0eXBlX3BhcmFtZXRlcnMnLCAndHlwZV9wYXJhbWV0ZXInLCAndHlwZV9hbm5vdGF0aW9uJyxcclxuICAgICAgICAgICdvYmplY3RfdHlwZScsICdwcmVkZWZpbmVkX3R5cGUnLCAncGFyZW50aGVzaXplZF90eXBlJywgJ2xpdGVyYWxfdHlwZScsXHJcbiAgICAgICAgICAnaW50ZXJzZWN0aW9uX3R5cGUnLCAndW5pb25fdHlwZScsXHJcbiAgICAgICAgICAnY2xhc3NfYm9keScsXHJcbiAgICAgICAgICAnZXh0ZW5kc19jbGF1c2UnLFxyXG4gICAgICAgICAgJ3VuYXJ5X2V4cHJlc3Npb24nLCAnYmluYXJ5X2V4cHJlc3Npb24nLCAnbWVtYmVyX2V4cHJlc3Npb24nLFxyXG4gICAgICAgICAgJ3N0YXRlbWVudF9ibG9jaycsICdyZXR1cm5fc3RhdGVtZW50JywgJ2V4cG9ydF9zdGF0ZW1lbnQnLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnLFxyXG4gICAgICAgICAgLy8gQSBjYWxsX3NpZ25hdHVyZSBjYW4gYWxzbyBiZSBhIG5vbi1jb250ZXh0dWFsIG5vZGVcclxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXHJcbiAgICAgICAgICAnaW50ZXJuYWxfbW9kdWxlJyxcclxuICAgICAgICAgICd2YXJpYWJsZV9kZWNsYXJhdG9yJyxcclxuICAgICAgICAgICdvYmplY3QnXHJcbiAgICAgICAgKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyogTWF0Y2ggdGVybWluYWxzICovXHJcbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXHJcbiAgICAgICAgICAnaWRlbnRpZmllcicsICdleHRlbmRzJywgJ3Byb3BlcnR5X2lkZW50aWZpZXInLCAnYWNjZXNzaWJpbGl0eV9tb2RpZmllcicsXHJcbiAgICAgICAgICAnc3RyaW5nJywgJ3ZvaWQnLCAnYm9vbGVhbicsICdudWxsJywgJ3VuZGVmaW5lZCcsICdudW1iZXInLCAncmV0dXJuJyxcclxuICAgICAgICAgICdnZXQnLCAnZnVuY3Rpb24nLCAnbmFtZXNwYWNlJywgJ2NvbnN0J1xyXG4gICAgICAgICkpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0VGVybWluYWwobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2aXNpdENoaWxkcmVuID0gKG5vZGVzOiBTeW50YXhOb2RlW10pOiBBU1ROb2RlW10gPT4ge1xyXG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xyXG4gICAgICBpZiAoIW5vZGUudHlwZS5tYXRjaCgvWzw+KCl7fSw6O1xcW1xcXSZ8PVxcK1xcLVxcKlxcL10vKSAmJiBub2RlLnR5cGUgIT09ICcuLi4nKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnZpc2l0Tm9kZShub2RlKTtcclxuICAgICAgICBpZiAoY2hpbGQpIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcclxuICAgIGxldCB2aXNpdGVkID0ge30sXHJcbiAgICAgIGdldFN0YXJ0TG9jYXRpb24gPSAobjogQVNUTm9kZSkgPT4gYCR7bi5sb2NhdGlvbi5yb3cuc3RhcnR9OiR7bi5sb2NhdGlvbi5jb2x1bW4uc3RhcnR9YDtcclxuICAgIC8vIEEgcHJvZ3JhbSBjYW4gaGF2ZSBtb2R1bGVzLCBuYW1lc3BhY2VzLCBjb21tZW50cyBhcyBpdHMgY2hpbGRyZW5cclxuICAgIC8vIFRoZSBmaXJzdCBzdGVwIGlzIHRvIHBhcnNlIGFsbCB0aGUgY29tbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxyXG4gICAgbGV0IGNvbW1lbnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpKTtcclxuICAgIC8vIFBhcnNlIHRoZSBuYW1lc3BhY2VzIGluIGV4cHJlc3Npb25fc3RhdGVtZW50XHJcbiAgICBsZXQgbmFtZXNwYWNlcyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpO1xyXG4gICAgLy8gUGFyc2UgdGhlIGV4cG9ydCBzdGF0ZW1lbnRzIGluIHRoZSByb290IG5vZGVcclxuICAgIGxldCBleHBvcnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHZpc2l0ZWQgY29udGV4dCBub2Rlc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjb21tZW50ID0gY29tbWVudHNbaV07XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50O1xyXG4gICAgICB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oY29udGV4dCldID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIHZpc2l0ZWQgbm9kZXMgZnJvbSBuYW1lc3BhY2VzIGFycmF5XHJcbiAgICBfLnJlbW92ZShuYW1lc3BhY2VzLCB4ID0+IHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pO1xyXG5cclxuICAgIC8vIEV4cG9ydHMgYXJlIG9kZGJhbGxzIHNpbmNlIHNvbWUgZXhwb3J0cyBtYXkgcmVmZXJlbmNlXHJcbiAgICAvLyBhIHR5cGUvbm9kZSB0aGF0IG1heSBoYXZlIGJlZW4gY29tbWVudGVkLlxyXG4gICAgLy8gV2UnbGwgZmlyc3QgbmVlZCB0byBmaWx0ZXIgdGhlIG9uZXMgd2UgaGF2ZSB2aXNpdGVkXHJcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IHZpc2l0ZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pO1xyXG5cclxuICAgIC8vIEZyb20gdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZCwgd2UnbGwgbmVlZCB0byBtb2RpZnlcclxuICAgIC8vIHRoZSBub2RlIHByb3BlcnRpZXMgb2YgZWFjaCBjb250ZXh0IGluIGEgY29tbWVudCBub2RlIHRoYXRcclxuICAgIC8vIG1hdGNoZXMgdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZC5cclxuICAgIGNvbnN0IG1hdGNoZWQgPSB7fTtcclxuICAgIGNvbW1lbnRzID0gXy5jb21wYWN0KFxyXG4gICAgICBjb21tZW50cy5tYXAoY29tbWVudCA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBvcnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBjb25zdCBleHBvcnRfID0gZXhwb3J0c1tpXTtcclxuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50LmNvbnRleHQ7XHJcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgY29udGV4dCAmJiBqIDwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoY29udGV4dC5jaGlsZHJlbltpXSAmJiBjb250ZXh0LmNoaWxkcmVuW2ldLnR5cGUgPT09IGV4cG9ydF8udHlwZSkge1xyXG4gICAgICAgICAgICAgIG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbihleHBvcnRfKV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihcclxuICAgICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzIHx8IHt9LFxyXG4gICAgICAgICAgICAgICAgZXhwb3J0Xy5wcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29tbWVudDtcclxuICAgICAgfSkpO1xyXG5cclxuICAgIC8vIFJlbW92ZWQgdGhlIG1hdGNoZWQgZXhwb3J0c1xyXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiBtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKVxyXG5cclxuICAgIHJldHVybiBbXS5jb25jYXQoY29tbWVudHMpLmNvbmNhdChuYW1lc3BhY2VzKS5jb25jYXQoZXhwb3J0cyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkgJiYgIWlzTGVnYWxDb21tZW50KHRoaXMuc291cmNlLCBub2RlKSkge1xyXG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IHNpYmxpbmcobm9kZSk7XHJcbiAgICAgIGlmIChuZXh0U2libGluZykge1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q29udGV4dChuZXh0U2libGluZywge30pLCB0cnVlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBWaXNpdCB0aGUgY29udGV4dHVhbCBub2RlXHJcbiAgICogXHJcbiAgICogIyBSZW1hcmtcclxuICAgKiBcclxuICAgKiBBIG5vZGUgaXMgY29uc2lkZXJlZCBjb250ZXh0dWFsIHdoZW4gYSBjb21tZW50IGlzIHZpc2l0ZWQgYW5kIHRoZSBub2RlIGlzIGl0cyBzaWJsaW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdmlzaXRDb250ZXh0ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcclxuICAgICAgY2FzZSAnZXhwb3J0X3N0YXRlbWVudCc6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHBvcnRTdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICAgIGNhc2UgJ2V4cHJlc3Npb25fc3RhdGVtZW50JzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICAgIGNhc2UgJ2NsYXNzJzpcclxuICAgICAgY2FzZSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENsYXNzT3JJbnRlcmZhY2Uobm9kZSwgcHJvcGVydGllcylcclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxyXG4gICAgICBjYXNlICdjYWxsX3NpZ25hdHVyZSc6XHJcbiAgICAgIGNhc2UgJ21ldGhvZF9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdwcm9wZXJ0eV9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdwdWJsaWNfZmllbGRfZGVmaW5pdGlvbic6XHJcbiAgICAgIGNhc2UgJ21ldGhvZF9kZWZpbml0aW9uJzpcclxuICAgICAgY2FzZSAnbGV4aWNhbF9kZWNsYXJhdGlvbic6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyogU3RhdGVtZW50cyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgZGVmYXVsdEV4cG9ydCA9IGZhbHNlO1xyXG4gICAgLy8gUmVtb3ZlICdleHBvcnQnIHNpbmNlIGl0J3MgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxyXG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcclxuICAgIGlmICh0aGlzLmhhc0RlZmF1bHRFeHBvcnQobm9kZSkpIHtcclxuICAgICAgZGVmYXVsdEV4cG9ydCA9IHRydWU7XHJcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XHJcbiAgICAgIGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQsIHsgZXhwb3J0czogeyBleHBvcnQ6IHRydWUsIGRlZmF1bHQ6IGRlZmF1bHRFeHBvcnQgfSB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmlzaXRFeHByZXNzaW9uU3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM6IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xyXG5cclxuICAgIGlmIChtYXRjaChjaGlsZCwgJ2ludGVybmFsX21vZHVsZScpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUoY2hpbGQsIHByb3BlcnRpZXMpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnZnVuY3Rpb24nKSkge1xyXG4gICAgICBpZiAocHJvcGVydGllcykgcmV0dXJuIHRoaXMudmlzaXRDb250ZXh0KGNoaWxkLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKGNoaWxkKVxyXG4gIH1cclxuXHJcbiAgLyogTW9kdWxlcyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0SW50ZXJuYWxNb2R1bGUgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IG5vZGUuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcclxuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnc3RhdGVtZW50X2Jsb2NrJykpIHtcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShjaGlsZCwgJ2NvbW1lbnQnKSkpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIGNoaWxkcmVuLCBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHsgbmFtZXNwYWNlOiB0cnVlIH0pKTtcclxuICB9XHJcblxyXG5cclxuICAvKiBEZWNsYXJhdGlvbnMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdENsYXNzT3JJbnRlcmZhY2UgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8VHlwZVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICAvLyBTaW5jZSAnaW50ZXJmYWNlJyBvciAnY2xhc3MnIGlzIGFsd2F5cyBmaXJzdCBpbiB0aGUgYXJyYXlcclxuICAgIC8vIHdlJ2xsIG5lZWQgdG8gcmVtb3ZlIGl0IGZyb20gdGhlIGFycmF5LlxyXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcclxuICAgIGNvbnN0IGludGVyZmFjZV8gPSBjaGlsZHJlbi5zaGlmdCgpO1xyXG4gICAgbGV0IGV4dGVuZHNfID0gZmFsc2UsIGltcGxlbWVudHNfID0gZmFsc2U7XHJcbiAgICBpZiAodGhpcy5oYXNJbmhlcml0YW5jZShub2RlKSkge1xyXG4gICAgICBjb25zdCBpbmhlcml0YW5jZSA9IHRoaXMuZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGUpXHJcbiAgICAgIGV4dGVuZHNfID0gaW5oZXJpdGFuY2UgPT09ICdleHRlbmRzJztcclxuICAgICAgaW1wbGVtZW50c18gPSBpbmhlcml0YW5jZSA9PT0gJ2ltcGxlbWVudHMnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5vZGVfID0gY3JlYXRlQVNUTm9kZShcclxuICAgICAgdGhpcy5zb3VyY2UsXHJcbiAgICAgIG5vZGUsXHJcbiAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksXHJcbiAgICAgIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcyB8fCB7fSwge1xyXG4gICAgICAgIGluaGVyaXRhbmNlOiB7XHJcbiAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzXyxcclxuICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNfXHJcbiAgICAgICAgfSBhcyBUeXBlU2NyaXB0SW5oZXJpdGFuY2VcclxuICAgICAgfSkpO1xyXG5cclxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3MnKSkge1xyXG4gICAgICByZXR1cm4gbm9kZV87XHJcbiAgICB9XHJcbiAgICAvLyBPdmVyd3JpdGUgdGhlIG5vZGUgdHlwZSBmcm9tICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nIHRvICdpbnRlcmZhY2UnXHJcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihub2RlXywgeyB0eXBlOiBpbnRlcmZhY2VfLnR5cGUgfSlcclxuICB9XHJcblxyXG4gIC8qIE5vbi10ZXJtaW5hbHMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdE5vblRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPFR5cGVTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcclxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIHNvbWUgbm9uLXRlcm1pbmFsc1xyXG4gICAgLy8gY29udGFpbiBjb21tZW50cyB3aGljaCBpcyB3aGF0IHdlIGNhcmUgYWJvdXRcclxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3NfYm9keScsICdvYmplY3RfdHlwZScpKSB7XHJcbiAgICAgIGNoaWxkcmVuID0gdGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50Jyk7XHJcbiAgICB9XHJcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBleHBvcnQgc3RhdGVtZW50cyBoYXZlIG5vZGUgcHJvcGVydGllc1xyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdleHBvcnRfc3RhdGVtZW50JykpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHBvcnRTdGF0ZW1lbnQobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYW4gaW50ZXJuYWwgbW9kdWxlIGNvbnRhaW5zIG90aGVyIG5vZGVzXHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2ludGVybmFsX21vZHVsZScpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUobm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYW4gaW50ZXJtYWxfbW9kdWxlIGNhbiBleGlzdCBpbiBhbiBleHByZXNzaW9uX3N0YXRlbWVudFxyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2Z1bmN0aW9uJykpIHtcclxuICAgICAgXy5yZW1vdmUoY2hpbGRyZW4sIGNoaWxkID0+IG1hdGNoKGNoaWxkLCAnc3RhdGVtZW50X2Jsb2NrJykpXHJcbiAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XHJcbiAgfVxyXG5cclxuICAvKiBUZXJtaW5hbHMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdFRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxyXG4gIH1cclxufSJdfQ==