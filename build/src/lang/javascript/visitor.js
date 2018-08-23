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
                    if (match_1.default(node, 'constraint', 'formal_parameters', 'required_parameter', 'rest_parameter', 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type', 'predefined_type', 'parenthesized_type', 'literal_type', 'intersection_type', 'union_type', 'class_body', 'extends_clause', 'unary_expression', 'binary_expression', 'parenthesized_expression', 'member_expression', 'statement_block', 'return_statement', 'export_statement', 'expression_statement', 
                    // A call_signature can also be a non-contextual node
                    'call_signature', 'internal_module', 'if_statement')) {
                        return this.visitNonTerminal(node, properties);
                    }
                    /* Match terminals */
                    if (match_1.default(node, 'identifier', 'extends', 'property_identifier', 'accessibility_modifier', 'null', 'undefined', 'return', 'get', 'function', 'namespace', 'if', 'const')) {
                        return this.visitTerminal(node);
                    }
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
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
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
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
            if (match_1.default(node, 'function')) {
                _.remove(children, child => match_1.default(child, 'statement_block'));
                console.log(children);
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
exports.JavaScriptVisitor = JavaScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2phdmFzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUF1RDtBQUN2RCxpREFBdUQ7QUFHdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBR3RDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUFvQyxFQUNwQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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QixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0ssVUFBVSxDQUFDLElBQWdCLEVBQUUsSUFBWTtRQUMvQyw2QkFBNkI7UUFDN0IsSUFBSSxRQUFRLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELGdDQUFnQztRQUNoQyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQixDQUFDO0NBNlFGO0FBalZELDhDQWlWQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUFTVE5vZGUsIEFTVE5vZGUgfSBmcm9tIFwiLi4vY29tbW9uL2FzdFwiO1xuaW1wb3J0IHsgaXNKYXZhRG9jQ29tbWVudCB9IGZyb20gXCIuLi8uLi91dGlscy9jb21tZW50XCI7XG5pbXBvcnQgeyBOb2RlUHJvcGVydGllcywgTm9kZUluaGVyaXRhbmNlIH0gZnJvbSBcIi4uL2NvbW1vbi9lbWNhXCI7XG5pbXBvcnQgeyBOb2RlVmlzaXRvciB9IGZyb20gXCIuLi9jb21tb24vbm9kZVwiO1xuaW1wb3J0IHsgc2libGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zaWJsaW5nXCI7XG5pbXBvcnQgeyBTeW50YXhOb2RlIH0gZnJvbSBcInRyZWUtc2l0dGVyXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi91dGlscy9sb2dcIjtcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vdXRpbHMvbWF0Y2hcIjtcbmltcG9ydCBTb3VyY2UgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvU291cmNlXCI7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHZpc2l0cyBBU1ROb2RlcyBmcm9tIGEgVHlwZVNjcmlwdCB0cmVlLlxuICovXG5leHBvcnQgY2xhc3MgSmF2YVNjcmlwdFZpc2l0b3IgaW1wbGVtZW50cyBOb2RlVmlzaXRvciB7XG4gIHByaXZhdGUgYXN0OiBBU1ROb2RlW10gPSBbXVxuICBwcml2YXRlIHNvdXJjZTogU291cmNlXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgbm9kZSBoYXMgaW5oZXJpdGFuY2VcbiAgICovXG4gIHByaXZhdGUgaGFzSW5oZXJpdGFuY2Uobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGxldCBpbmhlcml0cyA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycsICdpbXBsZW1lbnRzJykpIHtcbiAgICAgICAgaW5oZXJpdHMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5oZXJpdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbm9kZSdzIGluaGVyaXRhbmNlIHR5cGVcbiAgICovXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnKSkge1xuICAgICAgICByZXR1cm4gJ2V4dGVuZHMnO1xuICAgICAgfVxuXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdpbXBsZW1lbnRzJykpIHtcbiAgICAgICAgcmV0dXJuICdpbXBsZW1lbnRzJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGV4cG9ydCBpcyBkZWZhdWx0XG4gICAqL1xuICBwcml2YXRlIGhhc0RlZmF1bHRFeHBvcnQobm9kZTogU3ludGF4Tm9kZSk6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZGVmYXVsdCcpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBvbmx5IHRoZSBjb21tZW50cyBmcm9tIGEgbm9kZSdzIGNoaWxkcmVuLlxuICAgKi9cbiAgcHJpdmF0ZSBmaWx0ZXJUeXBlKG5vZGU6IFN5bnRheE5vZGUsIHR5cGU6IHN0cmluZyk6IFN5bnRheE5vZGVbXSB7XG4gICAgLy8gY29uc29sZS50aW1lKCdmaWx0ZXJUeXBlJylcbiAgICBsZXQgY2hpbGRyZW46IFN5bnRheE5vZGVbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCB0eXBlKSkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gY29uc29sZS50aW1lRW5kKCdmaWx0ZXJUeXBlJylcbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICBnZXRBU1QoKTogQVNUTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5hc3Q7XG4gIH1cblxuICAvKiBWaXNpdG9ycyAgKi9cblxuICB2aXNpdE5vZGUgPSAoXG4gICAgbm9kZTogU3ludGF4Tm9kZSxcbiAgICBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz5cbiAgKSA9PiB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3Byb2dyYW0nOlxuICAgICAgICB0aGlzLmFzdCA9IHRoaXMudmlzaXRQcm9ncmFtKG5vZGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbW1lbnQobm9kZSk7XG4gICAgICBjYXNlICdNSVNTSU5HJzpcbiAgICAgIGNhc2UgJ0VSUk9SJzpcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLlRyZWVTaXR0ZXJQYXJzZUVycm9yKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuXG4gICAgICAgIC8qIE1hdGNoIG90aGVyIG5vbi10ZXJtaW5hbHMgKi9cblxuICAgICAgICBpZiAobWF0Y2gobm9kZSxcbiAgICAgICAgICAnY29uc3RyYWludCcsXG4gICAgICAgICAgJ2Zvcm1hbF9wYXJhbWV0ZXJzJywgJ3JlcXVpcmVkX3BhcmFtZXRlcicsICdyZXN0X3BhcmFtZXRlcicsXG4gICAgICAgICAgJ3R5cGVfaWRlbnRpZmllcicsICd0eXBlX3BhcmFtZXRlcnMnLCAndHlwZV9wYXJhbWV0ZXInLCAndHlwZV9hbm5vdGF0aW9uJyxcbiAgICAgICAgICAnb2JqZWN0X3R5cGUnLCAncHJlZGVmaW5lZF90eXBlJywgJ3BhcmVudGhlc2l6ZWRfdHlwZScsICdsaXRlcmFsX3R5cGUnLFxuICAgICAgICAgICdpbnRlcnNlY3Rpb25fdHlwZScsICd1bmlvbl90eXBlJyxcbiAgICAgICAgICAnY2xhc3NfYm9keScsXG4gICAgICAgICAgJ2V4dGVuZHNfY2xhdXNlJyxcbiAgICAgICAgICAndW5hcnlfZXhwcmVzc2lvbicsICdiaW5hcnlfZXhwcmVzc2lvbicsICdwYXJlbnRoZXNpemVkX2V4cHJlc3Npb24nLCAnbWVtYmVyX2V4cHJlc3Npb24nLFxuICAgICAgICAgICdzdGF0ZW1lbnRfYmxvY2snLCAncmV0dXJuX3N0YXRlbWVudCcsICdleHBvcnRfc3RhdGVtZW50JywgJ2V4cHJlc3Npb25fc3RhdGVtZW50JyxcbiAgICAgICAgICAvLyBBIGNhbGxfc2lnbmF0dXJlIGNhbiBhbHNvIGJlIGEgbm9uLWNvbnRleHR1YWwgbm9kZVxuICAgICAgICAgICdjYWxsX3NpZ25hdHVyZScsXG4gICAgICAgICAgJ2ludGVybmFsX21vZHVsZScsXG4gICAgICAgICAgJ2lmX3N0YXRlbWVudCdcbiAgICAgICAgKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSwgcHJvcGVydGllcylcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIE1hdGNoIHRlcm1pbmFscyAqL1xuICAgICAgICBpZiAobWF0Y2gobm9kZSxcbiAgICAgICAgICAnaWRlbnRpZmllcicsICdleHRlbmRzJywgJ3Byb3BlcnR5X2lkZW50aWZpZXInLCAnYWNjZXNzaWJpbGl0eV9tb2RpZmllcicsXG4gICAgICAgICAgJ251bGwnLCAndW5kZWZpbmVkJywgJ3JldHVybicsXG4gICAgICAgICAgJ2dldCcsICdmdW5jdGlvbicsICduYW1lc3BhY2UnLCAnaWYnLCAnY29uc3QnXG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFRlcm1pbmFsKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0Q2hpbGRyZW4gPSAobm9kZXM6IFN5bnRheE5vZGVbXSk6IEFTVE5vZGVbXSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICBpZiAoIW5vZGUudHlwZS5tYXRjaCgvWzw+KCl7fSw6O1xcW1xcXSZ8PVxcK1xcLVxcKlxcLyEuXS8pICYmIG5vZGUudHlwZSAhPT0gJy4uLicpIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnZpc2l0Tm9kZShub2RlKTtcbiAgICAgICAgaWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoaWxkcmVuO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdFByb2dyYW0gPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGVbXSA9PiB7XG4gICAgbGV0IHZpc2l0ZWQgPSB7fSxcbiAgICAgIGdldFN0YXJ0TG9jYXRpb24gPSAobjogQVNUTm9kZSkgPT4gYCR7bi5sb2NhdGlvbi5yb3cuc3RhcnR9OiR7bi5sb2NhdGlvbi5jb2x1bW4uc3RhcnR9YDtcbiAgICAvLyBBIHByb2dyYW0gY2FuIGhhdmUgbW9kdWxlcywgbmFtZXNwYWNlcywgY29tbWVudHMgYXMgaXRzIGNoaWxkcmVuXG4gICAgLy8gVGhlIGZpcnN0IHN0ZXAgaXMgdG8gcGFyc2UgYWxsIHRoZSBjb21tZW50cyBpbiB0aGUgcm9vdCBub2RlXG4gICAgbGV0IGNvbW1lbnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpKTtcbiAgICAvLyBQYXJzZSB0aGUgbmFtZXNwYWNlcyBpbiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgIC8vIGxldCBuYW1lc3BhY2VzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSk7XG4gICAgLy8gUGFyc2UgdGhlIGV4cG9ydCBzdGF0ZW1lbnRzIGluIHRoZSByb290IG5vZGVcbiAgICBsZXQgZXhwb3J0cyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cG9ydF9zdGF0ZW1lbnQnKSk7XG5cbiAgICAvLyBHZXQgdGhlIHZpc2l0ZWQgY29udGV4dCBub2Rlc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1tpXTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50O1xuICAgICAgdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKGNvbnRleHQpXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gRXhwb3J0cyBhcmUgb2RkYmFsbHMgc2luY2Ugc29tZSBleHBvcnRzIG1heSByZWZlcmVuY2VcbiAgICAvLyBhIHR5cGUvbm9kZSB0aGF0IG1heSBoYXZlIGJlZW4gY29tbWVudGVkLlxuICAgIC8vIFdlJ2xsIGZpcnN0IG5lZWQgdG8gZmlsdGVyIHRoZSBvbmVzIHdlIGhhdmUgdmlzaXRlZFxuICAgIF8ucmVtb3ZlKGV4cG9ydHMsIHggPT4gdmlzaXRlZFtnZXRTdGFydExvY2F0aW9uKHgpXSk7XG5cbiAgICAvLyBGcm9tIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQsIHdlJ2xsIG5lZWQgdG8gbW9kaWZ5XG4gICAgLy8gdGhlIG5vZGUgcHJvcGVydGllcyBvZiBlYWNoIGNvbnRleHQgaW4gYSBjb21tZW50IG5vZGUgdGhhdFxuICAgIC8vIG1hdGNoZXMgdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZC5cbiAgICBjb25zdCBtYXRjaGVkID0ge307XG4gICAgY29tbWVudHMgPSBfLmNvbXBhY3QoXG4gICAgICBjb21tZW50cy5tYXAoY29tbWVudCA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwb3J0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGV4cG9ydF8gPSBleHBvcnRzW2ldO1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50LmNvbnRleHQ7XG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGNvbnRleHQgJiYgaiA8IGNvbnRleHQuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmNoaWxkcmVuW2ldICYmIGNvbnRleHQuY2hpbGRyZW5baV0udHlwZSA9PT0gZXhwb3J0Xy50eXBlKSB7XG4gICAgICAgICAgICAgIG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbihleHBvcnRfKV0gPSB0cnVlO1xuICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnByb3BlcnRpZXMgfHwge30sXG4gICAgICAgICAgICAgICAgZXhwb3J0Xy5wcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21tZW50O1xuICAgICAgfSkpO1xuXG4gICAgLy8gUmVtb3ZlZCB0aGUgbWF0Y2hlZCBleHBvcnRzXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiBtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKVxuXG4gICAgcmV0dXJuIFtdLmNvbmNhdChjb21tZW50cykuY29uY2F0KGV4cG9ydHMpO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdENvbW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xuICAgIGlmIChpc0phdmFEb2NDb21tZW50KHRoaXMuc291cmNlLCBub2RlKSkge1xuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nKG5vZGUpO1xuICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q29udGV4dChuZXh0U2libGluZywge30pLCB0cnVlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdCB0aGUgY29udGV4dHVhbCBub2RlXG4gICAqIFxuICAgKiAjIFJlbWFya1xuICAgKiBcbiAgICogQSBub2RlIGlzIGNvbnNpZGVyZWQgY29udGV4dHVhbCB3aGVuIGEgY29tbWVudCBpcyB2aXNpdGVkIGFuZCB0aGUgbm9kZSBpcyBpdHMgc2libGluZy5cbiAgICovXG4gIHByaXZhdGUgdmlzaXRDb250ZXh0ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdleHBvcnRfc3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHBvcnRTdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XG4gICAgICBjYXNlICdleHByZXNzaW9uX3N0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDbGFzcyhub2RlLCBwcm9wZXJ0aWVzKVxuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgY2FzZSAnY2FsbF9zaWduYXR1cmUnOlxuICAgICAgY2FzZSAnbWV0aG9kX3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdwcm9wZXJ0eV9zaWduYXR1cmUnOlxuICAgICAgY2FzZSAncHVibGljX2ZpZWxkX2RlZmluaXRpb24nOlxuICAgICAgY2FzZSAnbWV0aG9kX2RlZmluaXRpb24nOlxuICAgICAgY2FzZSAnbGV4aWNhbF9kZWNsYXJhdGlvbic6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwobm9kZSwgcHJvcGVydGllcyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLyogU3RhdGVtZW50cyAqL1xuXG4gIHByaXZhdGUgdmlzaXRFeHBvcnRTdGF0ZW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgZGVmYXVsdEV4cG9ydCA9IGZhbHNlO1xuICAgIC8vIFJlbW92ZSAnZXhwb3J0JyBzaW5jZSBpdCdzIGFsd2F5cyBmaXJzdCBpbiB0aGUgYXJyYXlcbiAgICBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIGlmICh0aGlzLmhhc0RlZmF1bHRFeHBvcnQobm9kZSkpIHtcbiAgICAgIGRlZmF1bHRFeHBvcnQgPSB0cnVlO1xuICAgICAgLy8gUmVtb3ZlICdkZWZhdWx0JyBleHBvcnRcbiAgICAgIGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgfVxuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW4uc2hpZnQoKTtcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQsIHsgZXhwb3J0czogeyBleHBvcnQ6IHRydWUsIGRlZmF1bHQ6IGRlZmF1bHRFeHBvcnQgfSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRFeHByZXNzaW9uU3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM6IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XG5cbiAgICBpZiAobWF0Y2goY2hpbGQsICdpbnRlcm5hbF9tb2R1bGUnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcm5hbE1vZHVsZShjaGlsZCwgcHJvcGVydGllcylcbiAgICB9XG4gICAgXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnZnVuY3Rpb24nKSkge1xuICAgICAgaWYgKHByb3BlcnRpZXMpIHJldHVybiB0aGlzLnZpc2l0Q29udGV4dChjaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChjaGlsZClcbiAgfVxuXG4gIC8qIE1vZHVsZXMgKi9cblxuICBwcml2YXRlIHZpc2l0SW50ZXJuYWxNb2R1bGUgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuOiBBU1ROb2RlW10gPSBub2RlLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShjaGlsZCwgJ2NvbW1lbnQnKSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQpO1xuICAgIH0pO1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCBjaGlsZHJlbiwgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7IG5hbWVzcGFjZTogdHJ1ZSB9KSk7XG4gIH1cblxuXG4gIC8qIERlY2xhcmF0aW9ucyAqL1xuXG4gIHByaXZhdGUgdmlzaXRDbGFzcyA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICAvLyBTaW5jZSAnaW50ZXJmYWNlJyBvciAnY2xhc3MnIGlzIGFsd2F5cyBmaXJzdCBpbiB0aGUgYXJyYXlcbiAgICAvLyB3ZSdsbCBuZWVkIHRvIHJlbW92ZSBpdCBmcm9tIHRoZSBhcnJheS5cbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIGNvbnN0IGludGVyZmFjZV8gPSBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIGxldCBleHRlbmRzXyA9IGZhbHNlLCBpbXBsZW1lbnRzXyA9IGZhbHNlO1xuICAgIGlmICh0aGlzLmhhc0luaGVyaXRhbmNlKG5vZGUpKSB7XG4gICAgICBjb25zdCBpbmhlcml0YW5jZSA9IHRoaXMuZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGUpXG4gICAgICBleHRlbmRzXyA9IGluaGVyaXRhbmNlID09PSAnZXh0ZW5kcyc7XG4gICAgICBpbXBsZW1lbnRzXyA9IGluaGVyaXRhbmNlID09PSAnaW1wbGVtZW50cyc7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZV8gPSBjcmVhdGVBU1ROb2RlKFxuICAgICAgdGhpcy5zb3VyY2UsXG4gICAgICBub2RlLFxuICAgICAgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSxcbiAgICAgIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcyB8fCB7fSwge1xuICAgICAgICBpbmhlcml0YW5jZToge1xuICAgICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNfLFxuICAgICAgICAgIGV4dGVuZHM6IGV4dGVuZHNfXG4gICAgICAgIH0gYXMgTm9kZUluaGVyaXRhbmNlXG4gICAgICB9KSk7XG5cbiAgICBpZiAobWF0Y2gobm9kZSwgJ2NsYXNzJykpIHtcbiAgICAgIHJldHVybiBub2RlXztcbiAgICB9XG4gICAgLy8gT3ZlcndyaXRlIHRoZSBub2RlIHR5cGUgZnJvbSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJyB0byAnaW50ZXJmYWNlJ1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5vZGVfLCB7IHR5cGU6IGludGVyZmFjZV8udHlwZSB9KVxuICB9XG5cbiAgLyogTm9uLXRlcm1pbmFscyAqL1xuXG4gIHByaXZhdGUgdmlzaXROb25UZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIHNvbWUgbm9uLXRlcm1pbmFsc1xuICAgIC8vIGNvbnRhaW4gY29tbWVudHMgd2hpY2ggaXMgd2hhdCB3ZSBjYXJlIGFib3V0XG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzc19ib2R5JywgJ29iamVjdF90eXBlJykpIHtcbiAgICAgIGNoaWxkcmVuID0gdGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50Jyk7XG4gICAgfVxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGV4cG9ydCBzdGF0ZW1lbnRzIGhhdmUgbm9kZSBwcm9wZXJ0aWVzXG4gICAgaWYgKG1hdGNoKG5vZGUsICdleHBvcnRfc3RhdGVtZW50JykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybmFsIG1vZHVsZSBjb250YWlucyBvdGhlciBub2Rlc1xuICAgIGlmIChtYXRjaChub2RlLCAnaW50ZXJuYWxfbW9kdWxlJykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUobm9kZSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYW4gaW50ZXJtYWxfbW9kdWxlIGNhbiBleGlzdCBpbiBhbiBleHByZXNzaW9uX3N0YXRlbWVudFxuICAgIGlmIChtYXRjaChub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSkge1xuICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGEgZnVuY3Rpb24gaGFzIGEgc3RhdGVtZW50X2Jsb2NrXG4gICAgaWYgKG1hdGNoKG5vZGUsICdmdW5jdGlvbicpKSB7XG4gICAgICBfLnJlbW92ZShjaGlsZHJlbiwgY2hpbGQgPT4gbWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSlcbiAgICAgIGNvbnNvbGUubG9nKGNoaWxkcmVuKTtcbiAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XG4gIH1cblxuICAvKiBUZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0VGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxuICB9XG59Il19