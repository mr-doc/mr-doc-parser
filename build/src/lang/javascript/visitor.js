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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2phdmFzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUE4QztBQUM5QyxpREFBdUQ7QUFDdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBTXRDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFxRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUEwQyxFQUMxQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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QixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0ssVUFBVSxDQUFDLElBQWdCLEVBQUUsSUFBWTtRQUMvQyw2QkFBNkI7UUFDN0IsSUFBSSxRQUFRLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELGdDQUFnQztRQUNoQyxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQixDQUFDO0NBNlFGO0FBalZELDhDQWlWQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUFTVE5vZGUgfSBmcm9tIFwiLi4vY29tbW9uL2FzdFwiO1xyXG5pbXBvcnQgeyBpc0phdmFEb2NDb21tZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcclxuaW1wb3J0IHsgc2libGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zaWJsaW5nXCI7XHJcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcclxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xyXG5pbXBvcnQgbG9nLCB7IEVycm9yVHlwZSB9IGZyb20gXCIuLi8uLi91dGlscy9sb2dcIjtcclxuaW1wb3J0IG1hdGNoIGZyb20gXCIuLi8uLi91dGlscy9tYXRjaFwiO1xyXG5pbXBvcnQgU291cmNlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xyXG5pbXBvcnQgVmlzaXRvciBmcm9tIFwiLi4vY29tbW9uL3Zpc2l0b3JcIjtcclxuaW1wb3J0IEFTVE5vZGUgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvQVNUTm9kZVwiO1xyXG5pbXBvcnQgeyBKYXZhU2NyaXB0UHJvcGVydGllcywgSmF2YVNjcmlwdEluaGVyaXRhbmNlIH0gZnJvbSBcIi4vcHJvcGVydGllc1wiO1xyXG5cclxuLyoqXHJcbiAqIEEgY2xhc3MgdGhhdCB2aXNpdHMgQVNUTm9kZXMgZnJvbSBhIFR5cGVTY3JpcHQgdHJlZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBKYXZhU2NyaXB0VmlzaXRvciBpbXBsZW1lbnRzIFZpc2l0b3Ige1xyXG4gIHByaXZhdGUgYXN0OiBBU1ROb2RlW10gPSBbXVxyXG4gIHByaXZhdGUgc291cmNlOiBTb3VyY2VcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSkge1xyXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBub2RlIGhhcyBpbmhlcml0YW5jZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFzSW5oZXJpdGFuY2Uobm9kZTogU3ludGF4Tm9kZSkge1xyXG4gICAgbGV0IGluaGVyaXRzID0gZmFsc2U7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdleHRlbmRzJywgJ2ltcGxlbWVudHMnKSkge1xyXG4gICAgICAgIGluaGVyaXRzID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGluaGVyaXRzXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbm9kZSdzIGluaGVyaXRhbmNlIHR5cGVcclxuICAgKi9cclxuICBwcml2YXRlIGdldEluaGVyaXRhbmNlVHlwZShub2RlOiBTeW50YXhOb2RlKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdleHRlbmRzJykpIHtcclxuICAgICAgICByZXR1cm4gJ2V4dGVuZHMnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdpbXBsZW1lbnRzJykpIHtcclxuICAgICAgICByZXR1cm4gJ2ltcGxlbWVudHMnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gZXhwb3J0IGlzIGRlZmF1bHRcclxuICAgKi9cclxuICBwcml2YXRlIGhhc0RlZmF1bHRFeHBvcnQobm9kZTogU3ludGF4Tm9kZSk6IGJvb2xlYW4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZGVmYXVsdCcpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgb25seSB0aGUgY29tbWVudHMgZnJvbSBhIG5vZGUncyBjaGlsZHJlbi5cclxuICAgKi9cclxuICBwcml2YXRlIGZpbHRlclR5cGUobm9kZTogU3ludGF4Tm9kZSwgdHlwZTogc3RyaW5nKTogU3ludGF4Tm9kZVtdIHtcclxuICAgIC8vIGNvbnNvbGUudGltZSgnZmlsdGVyVHlwZScpXHJcbiAgICBsZXQgY2hpbGRyZW46IFN5bnRheE5vZGVbXSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcclxuICAgICAgaWYgKG1hdGNoKGNoaWxkLCB0eXBlKSkge1xyXG4gICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjb25zb2xlLnRpbWVFbmQoJ2ZpbHRlclR5cGUnKVxyXG4gICAgcmV0dXJuIGNoaWxkcmVuO1xyXG4gIH1cclxuXHJcbiAgZ2V0QVNUKCk6IEFTVE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc3Q7XHJcbiAgfVxyXG5cclxuICAvKiBWaXNpdG9ycyAgKi9cclxuXHJcbiAgdmlzaXROb2RlID0gKFxyXG4gICAgbm9kZTogU3ludGF4Tm9kZSxcclxuICAgIHByb3BlcnRpZXM/OiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPlxyXG4gICkgPT4ge1xyXG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcclxuICAgICAgY2FzZSAncHJvZ3JhbSc6XHJcbiAgICAgICAgdGhpcy5hc3QgPSB0aGlzLnZpc2l0UHJvZ3JhbShub2RlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY29tbWVudCc6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDb21tZW50KG5vZGUpO1xyXG4gICAgICBjYXNlICdNSVNTSU5HJzpcclxuICAgICAgY2FzZSAnRVJST1InOlxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5UcmVlU2l0dGVyUGFyc2VFcnJvcik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcblxyXG4gICAgICAgIC8qIE1hdGNoIG90aGVyIG5vbi10ZXJtaW5hbHMgKi9cclxuXHJcbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXHJcbiAgICAgICAgICAnY29uc3RyYWludCcsXHJcbiAgICAgICAgICAnZm9ybWFsX3BhcmFtZXRlcnMnLCAncmVxdWlyZWRfcGFyYW1ldGVyJywgJ3Jlc3RfcGFyYW1ldGVyJyxcclxuICAgICAgICAgICd0eXBlX2lkZW50aWZpZXInLCAndHlwZV9wYXJhbWV0ZXJzJywgJ3R5cGVfcGFyYW1ldGVyJywgJ3R5cGVfYW5ub3RhdGlvbicsXHJcbiAgICAgICAgICAnb2JqZWN0X3R5cGUnLCAncHJlZGVmaW5lZF90eXBlJywgJ3BhcmVudGhlc2l6ZWRfdHlwZScsICdsaXRlcmFsX3R5cGUnLFxyXG4gICAgICAgICAgJ2ludGVyc2VjdGlvbl90eXBlJywgJ3VuaW9uX3R5cGUnLFxyXG4gICAgICAgICAgJ2NsYXNzX2JvZHknLFxyXG4gICAgICAgICAgJ2V4dGVuZHNfY2xhdXNlJyxcclxuICAgICAgICAgICd1bmFyeV9leHByZXNzaW9uJywgJ2JpbmFyeV9leHByZXNzaW9uJywgJ3BhcmVudGhlc2l6ZWRfZXhwcmVzc2lvbicsICdtZW1iZXJfZXhwcmVzc2lvbicsXHJcbiAgICAgICAgICAnc3RhdGVtZW50X2Jsb2NrJywgJ3JldHVybl9zdGF0ZW1lbnQnLCAnZXhwb3J0X3N0YXRlbWVudCcsICdleHByZXNzaW9uX3N0YXRlbWVudCcsXHJcbiAgICAgICAgICAvLyBBIGNhbGxfc2lnbmF0dXJlIGNhbiBhbHNvIGJlIGEgbm9uLWNvbnRleHR1YWwgbm9kZVxyXG4gICAgICAgICAgJ2NhbGxfc2lnbmF0dXJlJyxcclxuICAgICAgICAgICdpbnRlcm5hbF9tb2R1bGUnLFxyXG4gICAgICAgICAgJ2lmX3N0YXRlbWVudCdcclxuICAgICAgICApKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiBNYXRjaCB0ZXJtaW5hbHMgKi9cclxuICAgICAgICBpZiAobWF0Y2gobm9kZSxcclxuICAgICAgICAgICdpZGVudGlmaWVyJywgJ2V4dGVuZHMnLCAncHJvcGVydHlfaWRlbnRpZmllcicsICdhY2Nlc3NpYmlsaXR5X21vZGlmaWVyJyxcclxuICAgICAgICAgICdudWxsJywgJ3VuZGVmaW5lZCcsICdyZXR1cm4nLFxyXG4gICAgICAgICAgJ2dldCcsICdmdW5jdGlvbicsICduYW1lc3BhY2UnLCAnaWYnLCAnY29uc3QnXHJcbiAgICAgICAgKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUZXJtaW5hbChub2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmlzaXRDaGlsZHJlbiA9IChub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdID0+IHtcclxuICAgIGxldCBjaGlsZHJlbjogQVNUTm9kZVtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgaWYgKCFub2RlLnR5cGUubWF0Y2goL1s8Pigpe30sOjtcXFtcXF0mfD1cXCtcXC1cXCpcXC8hLl0vKSAmJiBub2RlLnR5cGUgIT09ICcuLi4nKSB7XHJcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLnZpc2l0Tm9kZShub2RlKTtcclxuICAgICAgICBpZiAoY2hpbGQpIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2hpbGRyZW47XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcclxuICAgIGxldCB2aXNpdGVkID0ge30sXHJcbiAgICAgIGdldFN0YXJ0TG9jYXRpb24gPSAobjogQVNUTm9kZSkgPT4gYCR7bi5sb2NhdGlvbi5yb3cuc3RhcnR9OiR7bi5sb2NhdGlvbi5jb2x1bW4uc3RhcnR9YDtcclxuICAgIC8vIEEgcHJvZ3JhbSBjYW4gaGF2ZSBtb2R1bGVzLCBuYW1lc3BhY2VzLCBjb21tZW50cyBhcyBpdHMgY2hpbGRyZW5cclxuICAgIC8vIFRoZSBmaXJzdCBzdGVwIGlzIHRvIHBhcnNlIGFsbCB0aGUgY29tbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxyXG4gICAgbGV0IGNvbW1lbnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpKTtcclxuICAgIC8vIFBhcnNlIHRoZSBuYW1lc3BhY2VzIGluIGV4cHJlc3Npb25fc3RhdGVtZW50XHJcbiAgICAvLyBsZXQgbmFtZXNwYWNlcyA9IHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpO1xyXG4gICAgLy8gUGFyc2UgdGhlIGV4cG9ydCBzdGF0ZW1lbnRzIGluIHRoZSByb290IG5vZGVcclxuICAgIGxldCBleHBvcnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHZpc2l0ZWQgY29udGV4dCBub2Rlc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBjb21tZW50ID0gY29tbWVudHNbaV07XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjb21tZW50O1xyXG4gICAgICB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oY29udGV4dCldID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBFeHBvcnRzIGFyZSBvZGRiYWxscyBzaW5jZSBzb21lIGV4cG9ydHMgbWF5IHJlZmVyZW5jZVxyXG4gICAgLy8gYSB0eXBlL25vZGUgdGhhdCBtYXkgaGF2ZSBiZWVuIGNvbW1lbnRlZC5cclxuICAgIC8vIFdlJ2xsIGZpcnN0IG5lZWQgdG8gZmlsdGVyIHRoZSBvbmVzIHdlIGhhdmUgdmlzaXRlZFxyXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcclxuXHJcbiAgICAvLyBGcm9tIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQsIHdlJ2xsIG5lZWQgdG8gbW9kaWZ5XHJcbiAgICAvLyB0aGUgbm9kZSBwcm9wZXJ0aWVzIG9mIGVhY2ggY29udGV4dCBpbiBhIGNvbW1lbnQgbm9kZSB0aGF0XHJcbiAgICAvLyBtYXRjaGVzIHRoZSBvbmVzIHdlIGhhdmUgbm90IHZpc2l0ZWQuXHJcbiAgICBjb25zdCBtYXRjaGVkID0ge307XHJcbiAgICBjb21tZW50cyA9IF8uY29tcGFjdChcclxuICAgICAgY29tbWVudHMubWFwKGNvbW1lbnQgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXhwb3J0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgY29uc3QgZXhwb3J0XyA9IGV4cG9ydHNbaV07XHJcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY29tbWVudC5jb250ZXh0O1xyXG4gICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGNvbnRleHQgJiYgaiA8IGNvbnRleHQuY2hpbGRyZW4ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGNvbnRleHQuY2hpbGRyZW5baV0gJiYgY29udGV4dC5jaGlsZHJlbltpXS50eXBlID09PSBleHBvcnRfLnR5cGUpIHtcclxuICAgICAgICAgICAgICBtYXRjaGVkW2dldFN0YXJ0TG9jYXRpb24oZXhwb3J0XyldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oXHJcbiAgICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyB8fCB7fSxcclxuICAgICAgICAgICAgICAgIGV4cG9ydF8ucHJvcGVydGllc1xyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbW1lbnQ7XHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICAvLyBSZW1vdmVkIHRoZSBtYXRjaGVkIGV4cG9ydHNcclxuICAgIF8ucmVtb3ZlKGV4cG9ydHMsIHggPT4gbWF0Y2hlZFtnZXRTdGFydExvY2F0aW9uKHgpXSlcclxuXHJcbiAgICByZXR1cm4gW10uY29uY2F0KGNvbW1lbnRzKS5jb25jYXQoZXhwb3J0cyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkpIHtcclxuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nKG5vZGUpO1xyXG4gICAgICBpZiAobmV4dFNpYmxpbmcpIHtcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENvbnRleHQobmV4dFNpYmxpbmcsIHt9KSwgdHJ1ZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmlzaXQgdGhlIGNvbnRleHR1YWwgbm9kZVxyXG4gICAqIFxyXG4gICAqICMgUmVtYXJrXHJcbiAgICogXHJcbiAgICogQSBub2RlIGlzIGNvbnNpZGVyZWQgY29udGV4dHVhbCB3aGVuIGEgY29tbWVudCBpcyB2aXNpdGVkIGFuZCB0aGUgbm9kZSBpcyBpdHMgc2libGluZy5cclxuICAgKi9cclxuICBwcml2YXRlIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxKYXZhU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ2V4cG9ydF9zdGF0ZW1lbnQnOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICBjYXNlICdleHByZXNzaW9uX3N0YXRlbWVudCc6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICBjYXNlICdjbGFzcyc6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDbGFzcyhub2RlLCBwcm9wZXJ0aWVzKVxyXG4gICAgICBjYXNlICdmdW5jdGlvbic6XHJcbiAgICAgIGNhc2UgJ2NhbGxfc2lnbmF0dXJlJzpcclxuICAgICAgY2FzZSAnbWV0aG9kX3NpZ25hdHVyZSc6XHJcbiAgICAgIGNhc2UgJ3Byb3BlcnR5X3NpZ25hdHVyZSc6XHJcbiAgICAgIGNhc2UgJ3B1YmxpY19maWVsZF9kZWZpbml0aW9uJzpcclxuICAgICAgY2FzZSAnbWV0aG9kX2RlZmluaXRpb24nOlxyXG4gICAgICBjYXNlICdsZXhpY2FsX2RlY2xhcmF0aW9uJzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyogU3RhdGVtZW50cyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0RXhwb3J0U3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgZGVmYXVsdEV4cG9ydCA9IGZhbHNlO1xyXG4gICAgLy8gUmVtb3ZlICdleHBvcnQnIHNpbmNlIGl0J3MgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxyXG4gICAgY2hpbGRyZW4uc2hpZnQoKTtcclxuICAgIGlmICh0aGlzLmhhc0RlZmF1bHRFeHBvcnQobm9kZSkpIHtcclxuICAgICAgZGVmYXVsdEV4cG9ydCA9IHRydWU7XHJcbiAgICAgIC8vIFJlbW92ZSAnZGVmYXVsdCcgZXhwb3J0XHJcbiAgICAgIGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vZGUoY2hpbGQsIHsgZXhwb3J0czogeyBleHBvcnQ6IHRydWUsIGRlZmF1bHQ6IGRlZmF1bHRFeHBvcnQgfSB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmlzaXRFeHByZXNzaW9uU3RhdGVtZW50ID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM6IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xyXG5cclxuICAgIGlmIChtYXRjaChjaGlsZCwgJ2ludGVybmFsX21vZHVsZScpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJuYWxNb2R1bGUoY2hpbGQsIHByb3BlcnRpZXMpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1hdGNoKGNoaWxkLCAnZnVuY3Rpb24nKSkge1xyXG4gICAgICBpZiAocHJvcGVydGllcykgcmV0dXJuIHRoaXMudmlzaXRDb250ZXh0KGNoaWxkKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy52aXNpdE5vblRlcm1pbmFsKGNoaWxkKVxyXG4gIH1cclxuXHJcbiAgLyogTW9kdWxlcyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0SW50ZXJuYWxNb2R1bGUgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IG5vZGUuY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcclxuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnc3RhdGVtZW50X2Jsb2NrJykpIHtcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShjaGlsZCwgJ2NvbW1lbnQnKSkpXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIGNoaWxkcmVuLCBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHsgbmFtZXNwYWNlOiB0cnVlIH0pKTtcclxuICB9XHJcblxyXG5cclxuICAvKiBEZWNsYXJhdGlvbnMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdENsYXNzID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgLy8gU2luY2UgJ2ludGVyZmFjZScgb3IgJ2NsYXNzJyBpcyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XHJcbiAgICAvLyB3ZSdsbCBuZWVkIHRvIHJlbW92ZSBpdCBmcm9tIHRoZSBhcnJheS5cclxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XHJcbiAgICBjb25zdCBpbnRlcmZhY2VfID0gY2hpbGRyZW4uc2hpZnQoKTtcclxuICAgIGxldCBleHRlbmRzXyA9IGZhbHNlLCBpbXBsZW1lbnRzXyA9IGZhbHNlO1xyXG4gICAgaWYgKHRoaXMuaGFzSW5oZXJpdGFuY2Uobm9kZSkpIHtcclxuICAgICAgY29uc3QgaW5oZXJpdGFuY2UgPSB0aGlzLmdldEluaGVyaXRhbmNlVHlwZShub2RlKVxyXG4gICAgICBleHRlbmRzXyA9IGluaGVyaXRhbmNlID09PSAnZXh0ZW5kcyc7XHJcbiAgICAgIGltcGxlbWVudHNfID0gaW5oZXJpdGFuY2UgPT09ICdpbXBsZW1lbnRzJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBub2RlXyA9IGNyZWF0ZUFTVE5vZGUoXHJcbiAgICAgIHRoaXMuc291cmNlLFxyXG4gICAgICBub2RlLFxyXG4gICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLFxyXG4gICAgICBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHtcclxuICAgICAgICBpbmhlcml0YW5jZToge1xyXG4gICAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c18sXHJcbiAgICAgICAgICBleHRlbmRzOiBleHRlbmRzX1xyXG4gICAgICAgIH0gYXMgSmF2YVNjcmlwdEluaGVyaXRhbmNlXHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2NsYXNzJykpIHtcclxuICAgICAgcmV0dXJuIG5vZGVfO1xyXG4gICAgfVxyXG4gICAgLy8gT3ZlcndyaXRlIHRoZSBub2RlIHR5cGUgZnJvbSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJyB0byAnaW50ZXJmYWNlJ1xyXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obm9kZV8sIHsgdHlwZTogaW50ZXJmYWNlXy50eXBlIH0pXHJcbiAgfVxyXG5cclxuICAvKiBOb24tdGVybWluYWxzICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXROb25UZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxKYXZhU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XHJcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBzb21lIG5vbi10ZXJtaW5hbHNcclxuICAgIC8vIGNvbnRhaW4gY29tbWVudHMgd2hpY2ggaXMgd2hhdCB3ZSBjYXJlIGFib3V0XHJcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2NsYXNzX2JvZHknLCAnb2JqZWN0X3R5cGUnKSkge1xyXG4gICAgICBjaGlsZHJlbiA9IHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpO1xyXG4gICAgfVxyXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgZXhwb3J0IHN0YXRlbWVudHMgaGF2ZSBub2RlIHByb3BlcnRpZXNcclxuICAgIGlmIChtYXRjaChub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwb3J0U3RhdGVtZW50KG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybmFsIG1vZHVsZSBjb250YWlucyBvdGhlciBub2Rlc1xyXG4gICAgaWYgKG1hdGNoKG5vZGUsICdpbnRlcm5hbF9tb2R1bGUnKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKG5vZGUsIHByb3BlcnRpZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybWFsX21vZHVsZSBjYW4gZXhpc3QgaW4gYW4gZXhwcmVzc2lvbl9zdGF0ZW1lbnRcclxuICAgIGlmIChtYXRjaChub2RlLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSwgcHJvcGVydGllcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFuZGxlIHNwZWNpYWwgY2FzZXMgd2hlcmUgYSBmdW5jdGlvbiBoYXMgYSBzdGF0ZW1lbnRfYmxvY2tcclxuICAgIGlmIChtYXRjaChub2RlLCAnZnVuY3Rpb24nKSkge1xyXG4gICAgICBfLnJlbW92ZShjaGlsZHJlbiwgY2hpbGQgPT4gbWF0Y2goY2hpbGQsICdzdGF0ZW1lbnRfYmxvY2snKSlcclxuICAgICAgY29uc29sZS5sb2coY2hpbGRyZW4pO1xyXG4gICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksIHByb3BlcnRpZXMpO1xyXG4gIH1cclxuXHJcbiAgLyogVGVybWluYWxzICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXRUZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSlcclxuICB9XHJcbn0iXX0=