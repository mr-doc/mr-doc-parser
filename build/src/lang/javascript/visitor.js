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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL2phdmFzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUE4QztBQUM5QyxpREFBdUQ7QUFDdkQsaURBQThDO0FBRTlDLDRCQUE0QjtBQUM1Qix5Q0FBaUQ7QUFDakQsNkNBQXNDO0FBTXRDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFHNUIsWUFBWSxNQUFjO1FBRmxCLFFBQUcsR0FBYyxFQUFFLENBQUE7UUFtRTNCLGVBQWU7UUFFZixjQUFTLEdBQUcsQ0FDVixJQUFnQixFQUNoQixVQUEwQyxFQUMxQyxFQUFFO1lBQ0YsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLFNBQVM7b0JBQ1osSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuQyxNQUFNO2dCQUNSLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUNaLFlBQVksRUFDWixtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFDM0QsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQ3pFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQ3RFLG1CQUFtQixFQUFFLFlBQVksRUFDakMsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixrQkFBa0Is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SSxlQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUMzQixPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNLLFVBQVUsQ0FBQyxJQUFnQixFQUFFLElBQVk7UUFDL0MsSUFBSSxRQUFRLEdBQWlCLEVBQUUsQ0FBQztRQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLGVBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEI7U0FDRjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0E0UUY7QUE5VUQsOENBOFVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQVNUTm9kZSB9IGZyb20gXCIuLi9jb21tb24vYXN0XCI7XG5pbXBvcnQgeyBpc0phdmFEb2NDb21tZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcbmltcG9ydCB7IHNpYmxpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2libGluZ1wiO1xuaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbG9nXCI7XG5pbXBvcnQgbWF0Y2ggZnJvbSBcIi4uLy4uL3V0aWxzL21hdGNoXCI7XG5pbXBvcnQgU291cmNlIGZyb20gXCIuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xuaW1wb3J0IFZpc2l0b3IgZnJvbSBcIi4uL2NvbW1vbi92aXNpdG9yXCI7XG5pbXBvcnQgQVNUTm9kZSBmcm9tIFwiLi4vLi4vaW50ZXJmYWNlcy9BU1ROb2RlXCI7XG5pbXBvcnQgeyBKYXZhU2NyaXB0UHJvcGVydGllcywgSmF2YVNjcmlwdEluaGVyaXRhbmNlIH0gZnJvbSBcIi4vcHJvcGVydGllc1wiO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCB2aXNpdHMgQVNUTm9kZXMgZnJvbSBhIFR5cGVTY3JpcHQgdHJlZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEphdmFTY3JpcHRWaXNpdG9yIGltcGxlbWVudHMgVmlzaXRvciB7XG4gIHByaXZhdGUgYXN0OiBBU1ROb2RlW10gPSBbXVxuICBwcml2YXRlIHNvdXJjZTogU291cmNlXG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgbm9kZSBoYXMgaW5oZXJpdGFuY2VcbiAgICovXG4gIHByaXZhdGUgaGFzSW5oZXJpdGFuY2Uobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIGxldCBpbmhlcml0cyA9IGZhbHNlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZXh0ZW5kcycsICdpbXBsZW1lbnRzJykpIHtcbiAgICAgICAgaW5oZXJpdHMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5oZXJpdHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbm9kZSdzIGluaGVyaXRhbmNlIHR5cGVcbiAgICovXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgJ2V4dGVuZHMnKSkge1xuICAgICAgICByZXR1cm4gJ2V4dGVuZHMnO1xuICAgICAgfVxuXG4gICAgICBpZiAobWF0Y2goY2hpbGQsICdpbXBsZW1lbnRzJykpIHtcbiAgICAgICAgcmV0dXJuICdpbXBsZW1lbnRzJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGV4cG9ydCBpcyBkZWZhdWx0XG4gICAqL1xuICBwcml2YXRlIGhhc0RlZmF1bHRFeHBvcnQobm9kZTogU3ludGF4Tm9kZSk6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnZGVmYXVsdCcpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBvbmx5IHRoZSBjb21tZW50cyBmcm9tIGEgbm9kZSdzIGNoaWxkcmVuLlxuICAgKi9cbiAgcHJpdmF0ZSBmaWx0ZXJUeXBlKG5vZGU6IFN5bnRheE5vZGUsIHR5cGU6IHN0cmluZyk6IFN5bnRheE5vZGVbXSB7XG4gICAgbGV0IGNoaWxkcmVuOiBTeW50YXhOb2RlW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZHJlbltpXTtcbiAgICAgIGlmIChtYXRjaChjaGlsZCwgdHlwZSkpIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuXG4gIGdldEFTVCgpOiBBU1ROb2RlW10ge1xuICAgIHJldHVybiB0aGlzLmFzdDtcbiAgfVxuXG4gIC8qIFZpc2l0b3JzICAqL1xuXG4gIHZpc2l0Tm9kZSA9IChcbiAgICBub2RlOiBTeW50YXhOb2RlLFxuICAgIHByb3BlcnRpZXM/OiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPlxuICApID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAncHJvZ3JhbSc6XG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29tbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ01JU1NJTkcnOlxuICAgICAgY2FzZSAnRVJST1InOlxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3IpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgLyogTWF0Y2ggb3RoZXIgbm9uLXRlcm1pbmFscyAqL1xuXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxuICAgICAgICAgICdjb25zdHJhaW50JyxcbiAgICAgICAgICAnZm9ybWFsX3BhcmFtZXRlcnMnLCAncmVxdWlyZWRfcGFyYW1ldGVyJywgJ3Jlc3RfcGFyYW1ldGVyJyxcbiAgICAgICAgICAndHlwZV9pZGVudGlmaWVyJywgJ3R5cGVfcGFyYW1ldGVycycsICd0eXBlX3BhcmFtZXRlcicsICd0eXBlX2Fubm90YXRpb24nLFxuICAgICAgICAgICdvYmplY3RfdHlwZScsICdwcmVkZWZpbmVkX3R5cGUnLCAncGFyZW50aGVzaXplZF90eXBlJywgJ2xpdGVyYWxfdHlwZScsXG4gICAgICAgICAgJ2ludGVyc2VjdGlvbl90eXBlJywgJ3VuaW9uX3R5cGUnLFxuICAgICAgICAgICdjbGFzc19ib2R5JyxcbiAgICAgICAgICAnZXh0ZW5kc19jbGF1c2UnLFxuICAgICAgICAgICd1bmFyeV9leHByZXNzaW9uJywgJ2JpbmFyeV9leHByZXNzaW9uJywgJ3BhcmVudGhlc2l6ZWRfZXhwcmVzc2lvbicsICdtZW1iZXJfZXhwcmVzc2lvbicsXG4gICAgICAgICAgJ3N0YXRlbWVudF9ibG9jaycsICdyZXR1cm5fc3RhdGVtZW50JywgJ2V4cG9ydF9zdGF0ZW1lbnQnLCAnZXhwcmVzc2lvbl9zdGF0ZW1lbnQnLFxuICAgICAgICAgIC8vIEEgY2FsbF9zaWduYXR1cmUgY2FuIGFsc28gYmUgYSBub24tY29udGV4dHVhbCBub2RlXG4gICAgICAgICAgJ2NhbGxfc2lnbmF0dXJlJyxcbiAgICAgICAgICAnaW50ZXJuYWxfbW9kdWxlJyxcbiAgICAgICAgICAnaWZfc3RhdGVtZW50J1xuICAgICAgICApKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKVxuICAgICAgICB9XG5cbiAgICAgICAgLyogTWF0Y2ggdGVybWluYWxzICovXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxuICAgICAgICAgICdpZGVudGlmaWVyJywgJ2V4dGVuZHMnLCAncHJvcGVydHlfaWRlbnRpZmllcicsICdhY2Nlc3NpYmlsaXR5X21vZGlmaWVyJyxcbiAgICAgICAgICAnbnVsbCcsICd1bmRlZmluZWQnLCAncmV0dXJuJyxcbiAgICAgICAgICAnZ2V0JywgJ2Z1bmN0aW9uJywgJ25hbWVzcGFjZScsICdpZicsICdjb25zdCdcbiAgICAgICAgKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0VGVybWluYWwobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdmlzaXRDaGlsZHJlbiA9IChub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdID0+IHtcbiAgICBsZXQgY2hpbGRyZW46IEFTVE5vZGVbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgIGlmICghbm9kZS50eXBlLm1hdGNoKC9bPD4oKXt9LDo7XFxbXFxdJnw9XFwrXFwtXFwqXFwvIS5dLykgJiYgbm9kZS50eXBlICE9PSAnLi4uJykge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMudmlzaXROb2RlKG5vZGUpO1xuICAgICAgICBpZiAoY2hpbGQpIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICBwcml2YXRlIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcbiAgICBsZXQgdmlzaXRlZCA9IHt9LFxuICAgICAgZ2V0U3RhcnRMb2NhdGlvbiA9IChuOiBBU1ROb2RlKSA9PiBgJHtuLmxvY2F0aW9uLnJvdy5zdGFydH06JHtuLmxvY2F0aW9uLmNvbHVtbi5zdGFydH1gO1xuICAgIC8vIEEgcHJvZ3JhbSBjYW4gaGF2ZSBtb2R1bGVzLCBuYW1lc3BhY2VzLCBjb21tZW50cyBhcyBpdHMgY2hpbGRyZW5cbiAgICAvLyBUaGUgZmlyc3Qgc3RlcCBpcyB0byBwYXJzZSBhbGwgdGhlIGNvbW1lbnRzIGluIHRoZSByb290IG5vZGVcbiAgICBsZXQgY29tbWVudHMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdjb21tZW50JykpO1xuICAgIC8vIFBhcnNlIHRoZSBuYW1lc3BhY2VzIGluIGV4cHJlc3Npb25fc3RhdGVtZW50XG4gICAgLy8gbGV0IG5hbWVzcGFjZXMgPSB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJUeXBlKG5vZGUsICdleHByZXNzaW9uX3N0YXRlbWVudCcpKTtcbiAgICAvLyBQYXJzZSB0aGUgZXhwb3J0IHN0YXRlbWVudHMgaW4gdGhlIHJvb3Qgbm9kZVxuICAgIGxldCBleHBvcnRzID0gdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyVHlwZShub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKTtcblxuICAgIC8vIEdldCB0aGUgdmlzaXRlZCBjb250ZXh0IG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29tbWVudCA9IGNvbW1lbnRzW2ldO1xuICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQ7XG4gICAgICB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oY29udGV4dCldID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnRzIGFyZSBvZGRiYWxscyBzaW5jZSBzb21lIGV4cG9ydHMgbWF5IHJlZmVyZW5jZVxuICAgIC8vIGEgdHlwZS9ub2RlIHRoYXQgbWF5IGhhdmUgYmVlbiBjb21tZW50ZWQuXG4gICAgLy8gV2UnbGwgZmlyc3QgbmVlZCB0byBmaWx0ZXIgdGhlIG9uZXMgd2UgaGF2ZSB2aXNpdGVkXG4gICAgXy5yZW1vdmUoZXhwb3J0cywgeCA9PiB2aXNpdGVkW2dldFN0YXJ0TG9jYXRpb24oeCldKTtcblxuICAgIC8vIEZyb20gdGhlIG9uZXMgd2UgaGF2ZSBub3QgdmlzaXRlZCwgd2UnbGwgbmVlZCB0byBtb2RpZnlcbiAgICAvLyB0aGUgbm9kZSBwcm9wZXJ0aWVzIG9mIGVhY2ggY29udGV4dCBpbiBhIGNvbW1lbnQgbm9kZSB0aGF0XG4gICAgLy8gbWF0Y2hlcyB0aGUgb25lcyB3ZSBoYXZlIG5vdCB2aXNpdGVkLlxuICAgIGNvbnN0IG1hdGNoZWQgPSB7fTtcbiAgICBjb21tZW50cyA9IF8uY29tcGFjdChcbiAgICAgIGNvbW1lbnRzLm1hcChjb21tZW50ID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBleHBvcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgZXhwb3J0XyA9IGV4cG9ydHNbaV07XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IGNvbW1lbnQuY29udGV4dDtcbiAgICAgICAgICBmb3IgKGxldCBqID0gMDsgY29udGV4dCAmJiBqIDwgY29udGV4dC5jaGlsZHJlbi5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuY2hpbGRyZW5baV0gJiYgY29udGV4dC5jaGlsZHJlbltpXS50eXBlID09PSBleHBvcnRfLnR5cGUpIHtcbiAgICAgICAgICAgICAgbWF0Y2hlZFtnZXRTdGFydExvY2F0aW9uKGV4cG9ydF8pXSA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC5wcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgICAgICBjb21tZW50LmNvbnRleHQucHJvcGVydGllcyB8fCB7fSxcbiAgICAgICAgICAgICAgICBleHBvcnRfLnByb3BlcnRpZXNcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbW1lbnQ7XG4gICAgICB9KSk7XG5cbiAgICAvLyBSZW1vdmVkIHRoZSBtYXRjaGVkIGV4cG9ydHNcbiAgICBfLnJlbW92ZShleHBvcnRzLCB4ID0+IG1hdGNoZWRbZ2V0U3RhcnRMb2NhdGlvbih4KV0pXG5cbiAgICByZXR1cm4gW10uY29uY2F0KGNvbW1lbnRzKS5jb25jYXQoZXhwb3J0cyk7XG4gIH1cblxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XG4gICAgaWYgKGlzSmF2YURvY0NvbW1lbnQodGhpcy5zb3VyY2UsIG5vZGUpKSB7XG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IHNpYmxpbmcobm9kZSk7XG4gICAgICBpZiAobmV4dFNpYmxpbmcpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDb250ZXh0KG5leHRTaWJsaW5nLCB7fSksIHRydWUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZpc2l0IHRoZSBjb250ZXh0dWFsIG5vZGVcbiAgICogXG4gICAqICMgUmVtYXJrXG4gICAqIFxuICAgKiBBIG5vZGUgaXMgY29uc2lkZXJlZCBjb250ZXh0dWFsIHdoZW4gYSBjb21tZW50IGlzIHZpc2l0ZWQgYW5kIHRoZSBub2RlIGlzIGl0cyBzaWJsaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdENvbnRleHQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2V4cG9ydF9zdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGNhc2UgJ2V4cHJlc3Npb25fc3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIHByb3BlcnRpZXMpO1xuICAgICAgY2FzZSAnY2xhc3MnOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdENsYXNzKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICBjYXNlICdjYWxsX3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdtZXRob2Rfc2lnbmF0dXJlJzpcbiAgICAgIGNhc2UgJ3Byb3BlcnR5X3NpZ25hdHVyZSc6XG4gICAgICBjYXNlICdwdWJsaWNfZmllbGRfZGVmaW5pdGlvbic6XG4gICAgICBjYXNlICdtZXRob2RfZGVmaW5pdGlvbic6XG4gICAgICBjYXNlICdsZXhpY2FsX2RlY2xhcmF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXROb25UZXJtaW5hbChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvKiBTdGF0ZW1lbnRzICovXG5cbiAgcHJpdmF0ZSB2aXNpdEV4cG9ydFN0YXRlbWVudCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxKYXZhU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLCBkZWZhdWx0RXhwb3J0ID0gZmFsc2U7XG4gICAgLy8gUmVtb3ZlICdleHBvcnQnIHNpbmNlIGl0J3MgYWx3YXlzIGZpcnN0IGluIHRoZSBhcnJheVxuICAgIGNoaWxkcmVuLnNoaWZ0KCk7XG4gICAgaWYgKHRoaXMuaGFzRGVmYXVsdEV4cG9ydChub2RlKSkge1xuICAgICAgZGVmYXVsdEV4cG9ydCA9IHRydWU7XG4gICAgICAvLyBSZW1vdmUgJ2RlZmF1bHQnIGV4cG9ydFxuICAgICAgY2hpbGRyZW4uc2hpZnQoKTtcbiAgICB9XG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbi5zaGlmdCgpO1xuICAgIHJldHVybiB0aGlzLnZpc2l0Tm9kZShjaGlsZCwgeyBleHBvcnRzOiB7IGV4cG9ydDogdHJ1ZSwgZGVmYXVsdDogZGVmYXVsdEV4cG9ydCB9IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdEV4cHJlc3Npb25TdGF0ZW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllczogUGFydGlhbDxKYXZhU2NyaXB0UHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW4uc2hpZnQoKTtcblxuICAgIGlmIChtYXRjaChjaGlsZCwgJ2ludGVybmFsX21vZHVsZScpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKGNoaWxkLCBwcm9wZXJ0aWVzKVxuICAgIH1cblxuICAgIGlmIChtYXRjaChjaGlsZCwgJ2Z1bmN0aW9uJykpIHtcbiAgICAgIGlmIChwcm9wZXJ0aWVzKSByZXR1cm4gdGhpcy52aXNpdENvbnRleHQoY2hpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZpc2l0Tm9uVGVybWluYWwoY2hpbGQpXG4gIH1cblxuICAvKiBNb2R1bGVzICovXG5cbiAgcHJpdmF0ZSB2aXNpdEludGVybmFsTW9kdWxlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPEphdmFTY3JpcHRQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xuICAgIGxldCBjaGlsZHJlbjogQVNUTm9kZVtdID0gbm9kZS5jaGlsZHJlbi5tYXAoY2hpbGQgPT4ge1xuICAgICAgaWYgKG1hdGNoKGNoaWxkLCAnc3RhdGVtZW50X2Jsb2NrJykpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlclR5cGUoY2hpbGQsICdjb21tZW50JykpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmlzaXROb2RlKGNoaWxkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgY2hpbGRyZW4sIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcyB8fCB7fSwgeyBuYW1lc3BhY2U6IHRydWUgfSkpO1xuICB9XG5cblxuICAvKiBEZWNsYXJhdGlvbnMgKi9cblxuICBwcml2YXRlIHZpc2l0Q2xhc3MgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgLy8gU2luY2UgJ2ludGVyZmFjZScgb3IgJ2NsYXNzJyBpcyBhbHdheXMgZmlyc3QgaW4gdGhlIGFycmF5XG4gICAgLy8gd2UnbGwgbmVlZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXkuXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICBjb25zdCBpbnRlcmZhY2VfID0gY2hpbGRyZW4uc2hpZnQoKTtcbiAgICBsZXQgZXh0ZW5kc18gPSBmYWxzZSwgaW1wbGVtZW50c18gPSBmYWxzZTtcbiAgICBpZiAodGhpcy5oYXNJbmhlcml0YW5jZShub2RlKSkge1xuICAgICAgY29uc3QgaW5oZXJpdGFuY2UgPSB0aGlzLmdldEluaGVyaXRhbmNlVHlwZShub2RlKVxuICAgICAgZXh0ZW5kc18gPSBpbmhlcml0YW5jZSA9PT0gJ2V4dGVuZHMnO1xuICAgICAgaW1wbGVtZW50c18gPSBpbmhlcml0YW5jZSA9PT0gJ2ltcGxlbWVudHMnO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGVfID0gY3JlYXRlQVNUTm9kZShcbiAgICAgIHRoaXMuc291cmNlLFxuICAgICAgbm9kZSxcbiAgICAgIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksXG4gICAgICBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMgfHwge30sIHtcbiAgICAgICAgaW5oZXJpdGFuY2U6IHtcbiAgICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzXyxcbiAgICAgICAgICBleHRlbmRzOiBleHRlbmRzX1xuICAgICAgICB9IGFzIEphdmFTY3JpcHRJbmhlcml0YW5jZVxuICAgICAgfSkpO1xuXG4gICAgaWYgKG1hdGNoKG5vZGUsICdjbGFzcycpKSB7XG4gICAgICByZXR1cm4gbm9kZV87XG4gICAgfVxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgbm9kZSB0eXBlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihub2RlXywgeyB0eXBlOiBpbnRlcmZhY2VfLnR5cGUgfSlcbiAgfVxuXG4gIC8qIE5vbi10ZXJtaW5hbHMgKi9cblxuICBwcml2YXRlIHZpc2l0Tm9uVGVybWluYWwgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8SmF2YVNjcmlwdFByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBzb21lIG5vbi10ZXJtaW5hbHNcbiAgICAvLyBjb250YWluIGNvbW1lbnRzIHdoaWNoIGlzIHdoYXQgd2UgY2FyZSBhYm91dFxuICAgIGlmIChtYXRjaChub2RlLCAnY2xhc3NfYm9keScsICdvYmplY3RfdHlwZScpKSB7XG4gICAgICBjaGlsZHJlbiA9IHRoaXMuZmlsdGVyVHlwZShub2RlLCAnY29tbWVudCcpO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBleHBvcnQgc3RhdGVtZW50cyBoYXZlIG5vZGUgcHJvcGVydGllc1xuICAgIGlmIChtYXRjaChub2RlLCAnZXhwb3J0X3N0YXRlbWVudCcpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEV4cG9ydFN0YXRlbWVudChub2RlKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhbiBpbnRlcm5hbCBtb2R1bGUgY29udGFpbnMgb3RoZXIgbm9kZXNcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2ludGVybmFsX21vZHVsZScpKSB7XG4gICAgICByZXR1cm4gdGhpcy52aXNpdEludGVybmFsTW9kdWxlKG5vZGUsIHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2VzIHdoZXJlIGFuIGludGVybWFsX21vZHVsZSBjYW4gZXhpc3QgaW4gYW4gZXhwcmVzc2lvbl9zdGF0ZW1lbnRcbiAgICBpZiAobWF0Y2gobm9kZSwgJ2V4cHJlc3Npb25fc3RhdGVtZW50JykpIHtcbiAgICAgIHJldHVybiB0aGlzLnZpc2l0RXhwcmVzc2lvblN0YXRlbWVudChub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgc3BlY2lhbCBjYXNlcyB3aGVyZSBhIGZ1bmN0aW9uIGhhcyBhIHN0YXRlbWVudF9ibG9ja1xuICAgIGlmIChtYXRjaChub2RlLCAnZnVuY3Rpb24nKSB8fCBtYXRjaChub2RlLCAnbWV0aG9kX2RlZmluaXRpb24nKSkge1xuICAgICAgXy5yZW1vdmUoY2hpbGRyZW4sIGNoaWxkID0+IG1hdGNoKGNoaWxkLCAnc3RhdGVtZW50X2Jsb2NrJykpXG4gICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgcHJvcGVydGllcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbihjaGlsZHJlbiksIHByb3BlcnRpZXMpO1xuICB9XG5cbiAgLyogVGVybWluYWxzICovXG5cbiAgcHJpdmF0ZSB2aXNpdFRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSlcbiAgfVxufSJdfQ==