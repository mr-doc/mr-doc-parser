"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../utils/comment");
const sibling_1 = require("../../utils/sibling");
const log_1 = require("../../utils/log");
const match_1 = require("../../utils/match");
const ast_1 = require("../common/ast");
class Node {
    constructor(syntaxNode) {
        this.syntaxNode = syntaxNode;
        this.visit = (visitor) => {
            visitor.visitNode(this.syntaxNode);
        };
    }
}
exports.Node = Node;
class TypeScriptVisitor {
    constructor(source) {
        this.ast = [];
        /* Visitors  */
        this.visitNode = (node) => {
            switch (node.type) {
                case 'program':
                    this.parent = node;
                    this.ast = this.visitProgram(node);
                case 'comment':
                    return this.visitComment(node);
                case 'MISSING':
                case 'ERROR':
                    log_1.default.report(this.source, node, log_1.ErrorType.TreeSitterParseError);
                    break;
                default:
                    /* Match other non-terminals */
                    if (match_1.default(node, 'constraint')) {
                        return this.visitConstraint(node);
                    }
                    if (match_1.default(node, 'formal_parameters')) {
                        return this.visitFormalParamters(node);
                    }
                    if (match_1.default(node, 'required_parameter')) {
                        return this.visitRequiredParameter(node);
                    }
                    if (match_1.default(node, 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type', 'predefined_type')) {
                        return this.visitTypeNode(node);
                    }
                    if (match_1.default(node, 'extends_clause')) {
                        return this.visitInheritanceClause(node);
                    }
                    // A call_signature can also be a non-contextual node
                    if (match_1.default(node, 'call_signature')) {
                        return this.visitSignature(node);
                    }
                    /* Match terminals */
                    if (match_1.default(node, 'identifier', 'extends', 'property_identifier', 'string', 'void', 'boolean', 'null', 'undefined', 'number')) {
                        return this.visitTerminal(node);
                    }
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        this.visitChildren = (nodes) => {
            return nodes
                .filter(child => !child.type.match(/[<>(){},:;\[\]]/))
                .map(this.visitNode.bind(this)).filter(child => !!child);
        };
        this.visitProgram = (node) => {
            return this.visitChildren(this.filterComments(node));
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
                case 'interface_declaration':
                    this.parent = node;
                    return this.visitInterfaceDeclaration(node, properties);
                case 'call_signature':
                case 'method_signature':
                    return this.visitSignature(node, properties);
                default:
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        /* Declarations */
        this.visitInterfaceDeclaration = (node, properties) => {
            // Shorten the node from 'interface_declaration' to 'interface'
            return this.visitInterface(node, properties);
        };
        this.visitInterface = (node, properties) => {
            // Since 'interface' is element in the array
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
            // Overwrite the node type from 'interface_declaration' to 'interface'
            return Object.assign(node_, { type: interface_.type });
        };
        /* Signatures */
        this.visitSignature = (node, properties) => {
            return ast_1.createASTNode(this.source, node, this.visitChildren(node.children), properties);
        };
        /* Types */
        this.visitTypeNode = (node) => {
            switch (node.type) {
                case 'type_identifier':
                    return this.visitTerminal(node);
                case 'type_parameters':
                case 'type_parameter':
                case 'type_annotation':
                case 'predefined_type':
                    return ast_1.createASTNode(this.source, node, this.visitChildren(node.children));
                case 'object_type':
                    return ast_1.createASTNode(this.source, node, this.visitChildren(this.filterComments(node)));
                default:
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        /* Other non-terminals */
        this.visitConstraint = (node) => {
            return ast_1.createASTNode(this.source, node, this.visitChildren(node.children));
        };
        this.visitInheritanceClause = (node) => {
            return ast_1.createASTNode(this.source, node, this.visitChildren(node.children));
        };
        this.visitFormalParamters = (node) => {
            return ast_1.createASTNode(this.source, node, this.visitChildren(node.children));
        };
        this.visitRequiredParameter = (node) => {
            return ast_1.createASTNode(this.source, node, this.visitChildren(node.children));
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
        return node.children
            .filter(node => {
            return node.type.includes('extends') || node.type.includes('implements');
        }).length > 0;
    }
    /**
     * Returns a node's inheritance type
     */
    getInheritanceType(node) {
        if (node.children.filter(node => node.type.includes('extends'))) {
            return 'extends';
        }
        if (node.children.filter(node => node.type.includes('implements'))) {
            return 'implements';
        }
    }
    filterComments(node) {
        return node.children.filter(child => match_1.default(child, 'comment'));
    }
    getAST() {
        return this.ast;
    }
}
exports.TypeScriptVisitor = TypeScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUF1RDtBQUN2RCxpREFBOEM7QUFHOUMseUNBQWlEO0FBQ2pELDZDQUFzQztBQUd0Qyx1Q0FBdUQ7QUFhdkQsTUFBYSxJQUFJO0lBQ2YsWUFBbUIsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN6QyxVQUFLLEdBQUcsQ0FBQyxPQUFvQixFQUFRLEVBQUU7WUFDckMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFBO0lBSDRDLENBQUM7Q0FJL0M7QUFMRCxvQkFLQztBQUVELE1BQWEsaUJBQWlCO0lBSTVCLFlBQVksTUFBYztRQUhsQixRQUFHLEdBQWMsRUFBRSxDQUFBO1FBcUMzQixlQUFlO1FBRWYsY0FBUyxHQUFHLENBQ1YsSUFBZ0IsRUFDaEIsRUFBRTtZQUNGLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDakIsS0FBSyxTQUFTO29CQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNuQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFF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UUFDekMsQ0FBQyxDQUFBO1FBeE5DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDRDs7T0FFRztJQUNLLGNBQWMsQ0FBQyxJQUFnQjtRQUNyQyxPQUFPLElBQUksQ0FBQyxRQUFRO2FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNiLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxrQkFBa0IsQ0FBQyxJQUFnQjtRQUN6QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRTtZQUMvRCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUVELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFO1lBQ2xFLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQUVPLGNBQWMsQ0FBQyxJQUFnQjtRQUNyQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsZUFBSyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ2xCLENBQUM7Q0EwTEY7QUE5TkQsOENBOE5DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm9kZVByb3BlcnRpZXMsIE5vZGVJbmhlcml0YW5jZSB9IGZyb20gXCIuLi9jb21tb24vZW1jYVwiO1xyXG5pbXBvcnQgeyBpc0phdmFEb2NDb21tZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbW1lbnRcIjtcclxuaW1wb3J0IHsgc2libGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zaWJsaW5nXCI7XHJcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcclxuaW1wb3J0IHsgdGV4dCB9IGZyb20gXCIuLi8uLi91dGlscy90ZXh0XCI7XHJcbmltcG9ydCBsb2csIHsgRXJyb3JUeXBlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2xvZ1wiO1xyXG5pbXBvcnQgbWF0Y2ggZnJvbSBcIi4uLy4uL3V0aWxzL21hdGNoXCI7XHJcbmltcG9ydCBTb3VyY2UgZnJvbSBcIi4uLy4uL2ludGVyZmFjZXMvU291cmNlXCI7XHJcbmltcG9ydCB4ZG9jIGZyb20gXCJ4ZG9jLXBhcnNlclwiO1xyXG5pbXBvcnQgeyBjcmVhdGVBU1ROb2RlLCBBU1ROb2RlIH0gZnJvbSBcIi4uL2NvbW1vbi9hc3RcIjtcclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVTaXR0ZXJOb2RlIHtcclxuICB2aXNpdCh2aXNpdG9yOiBOb2RlVmlzaXRvcik6IHZvaWRcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBOb2RlVmlzaXRvciB7XHJcbiAgZ2V0QVNUKCk6IEFTVE5vZGVbXVxyXG4gIHZpc2l0Tm9kZShub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVxyXG4gIHZpc2l0Q2hpbGRyZW4obm9kZXM6IFN5bnRheE5vZGVbXSk6IEFTVE5vZGVbXVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZSBpbXBsZW1lbnRzIFRyZWVTaXR0ZXJOb2RlIHtcclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3ludGF4Tm9kZTogU3ludGF4Tm9kZSkgeyB9XHJcbiAgdmlzaXQgPSAodmlzaXRvcjogTm9kZVZpc2l0b3IpOiB2b2lkID0+IHtcclxuICAgIHZpc2l0b3IudmlzaXROb2RlKHRoaXMuc3ludGF4Tm9kZSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHlwZVNjcmlwdFZpc2l0b3IgaW1wbGVtZW50cyBOb2RlVmlzaXRvciB7XHJcbiAgcHJpdmF0ZSBhc3Q6IEFTVE5vZGVbXSA9IFtdXHJcbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZVxyXG4gIHByaXZhdGUgcGFyZW50OiBTeW50YXhOb2RlXHJcbiAgY29uc3RydWN0b3Ioc291cmNlOiBTb3VyY2UpIHtcclxuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSBub2RlIGhhcyBpbmhlcml0YW5jZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGFzSW5oZXJpdGFuY2Uobm9kZTogU3ludGF4Tm9kZSkge1xyXG4gICAgcmV0dXJuIG5vZGUuY2hpbGRyZW5cclxuICAgICAgLmZpbHRlcihub2RlID0+IHtcclxuICAgICAgICByZXR1cm4gbm9kZS50eXBlLmluY2x1ZGVzKCdleHRlbmRzJykgfHwgbm9kZS50eXBlLmluY2x1ZGVzKCdpbXBsZW1lbnRzJyk7XHJcbiAgICAgIH0pLmxlbmd0aCA+IDBcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBub2RlJ3MgaW5oZXJpdGFuY2UgdHlwZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGU6IFN5bnRheE5vZGUpIHtcclxuICAgIGlmIChub2RlLmNoaWxkcmVuLmZpbHRlcihub2RlID0+IG5vZGUudHlwZS5pbmNsdWRlcygnZXh0ZW5kcycpKSkge1xyXG4gICAgICByZXR1cm4gJ2V4dGVuZHMnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChub2RlLmNoaWxkcmVuLmZpbHRlcihub2RlID0+IG5vZGUudHlwZS5pbmNsdWRlcygnaW1wbGVtZW50cycpKSkge1xyXG4gICAgICByZXR1cm4gJ2ltcGxlbWVudHMnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaWx0ZXJDb21tZW50cyhub2RlOiBTeW50YXhOb2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5jaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gbWF0Y2goY2hpbGQsICdjb21tZW50JykpO1xyXG4gIH1cclxuXHJcbiAgZ2V0QVNUKCk6IEFTVE5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc3Q7XHJcbiAgfVxyXG5cclxuICAvKiBWaXNpdG9ycyAgKi9cclxuXHJcbiAgdmlzaXROb2RlID0gKFxyXG4gICAgbm9kZTogU3ludGF4Tm9kZVxyXG4gICkgPT4ge1xyXG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcclxuICAgICAgY2FzZSAncHJvZ3JhbSc6XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBub2RlO1xyXG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XHJcbiAgICAgIGNhc2UgJ2NvbW1lbnQnOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudChub2RlKTtcclxuICAgICAgY2FzZSAnTUlTU0lORyc6XHJcbiAgICAgIGNhc2UgJ0VSUk9SJzpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3IpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG5cclxuICAgICAgICAvKiBNYXRjaCBvdGhlciBub24tdGVybWluYWxzICovXHJcblxyXG4gICAgICAgIGlmIChtYXRjaChub2RlLCAnY29uc3RyYWludCcpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbnN0cmFpbnQobm9kZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtYXRjaChub2RlLCAnZm9ybWFsX3BhcmFtZXRlcnMnKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRGb3JtYWxQYXJhbXRlcnMobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWF0Y2gobm9kZSwgJ3JlcXVpcmVkX3BhcmFtZXRlcicpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFJlcXVpcmVkUGFyYW1ldGVyKG5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsXHJcbiAgICAgICAgICAndHlwZV9pZGVudGlmaWVyJywgJ3R5cGVfcGFyYW1ldGVycycsICd0eXBlX3BhcmFtZXRlcicsICd0eXBlX2Fubm90YXRpb24nLFxyXG4gICAgICAgICAgJ29iamVjdF90eXBlJywgJ3ByZWRlZmluZWRfdHlwZSdcclxuICAgICAgICApKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFR5cGVOb2RlKG5vZGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWF0Y2gobm9kZSwgJ2V4dGVuZHNfY2xhdXNlJykpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0SW5oZXJpdGFuY2VDbGF1c2Uobm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBIGNhbGxfc2lnbmF0dXJlIGNhbiBhbHNvIGJlIGEgbm9uLWNvbnRleHR1YWwgbm9kZVxyXG4gICAgICAgIGlmIChtYXRjaChub2RlLCAnY2FsbF9zaWduYXR1cmUnKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRTaWduYXR1cmUobm9kZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIE1hdGNoIHRlcm1pbmFscyAqL1xyXG4gICAgICAgIGlmIChtYXRjaChub2RlLCBcclxuICAgICAgICAgICdpZGVudGlmaWVyJywgJ2V4dGVuZHMnLCAncHJvcGVydHlfaWRlbnRpZmllcicsXHJcbiAgICAgICAgICAnc3RyaW5nJywgJ3ZvaWQnLCAnYm9vbGVhbicsICdudWxsJywgJ3VuZGVmaW5lZCcsICdudW1iZXInXHJcbiAgICAgICAgKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUZXJtaW5hbChub2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XHJcblxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmlzaXRDaGlsZHJlbiA9IChub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdID0+IHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIG5vZGVzXHJcbiAgICAgICAgLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQudHlwZS5tYXRjaCgvWzw+KCl7fSw6O1xcW1xcXV0vKSlcclxuICAgICAgICAubWFwKHRoaXMudmlzaXROb2RlLmJpbmQodGhpcykpIGFzIEFTVE5vZGVbXVxyXG4gICAgKS5maWx0ZXIoY2hpbGQgPT4gISFjaGlsZCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcclxuICAgIHJldHVybiB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJDb21tZW50cyhub2RlKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0Q29tbWVudCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkpIHtcclxuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nKG5vZGUpO1xyXG4gICAgICBpZiAobmV4dFNpYmxpbmcpIHtcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENvbnRleHQobmV4dFNpYmxpbmcsIHt9KSwgdHJ1ZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmlzaXQgdGhlIGNvbnRleHR1YWwgbm9kZVxyXG4gICAqIFxyXG4gICAqICMgUmVtYXJrXHJcbiAgICogXHJcbiAgICogQSBub2RlIGlzIGNvbnNpZGVyZWQgY29udGV4dHVhbCB3aGVuIGEgY29tbWVudCBpcyB2aXNpdGVkIGFuZCB0aGUgbm9kZSBpcyBpdHMgc2libGluZy5cclxuICAgKi9cclxuICBwcml2YXRlIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ2ludGVyZmFjZV9kZWNsYXJhdGlvbic6XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBub2RlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJmYWNlRGVjbGFyYXRpb24obm9kZSwgcHJvcGVydGllcylcclxuICAgICAgY2FzZSAnY2FsbF9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdtZXRob2Rfc2lnbmF0dXJlJzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdFNpZ25hdHVyZShub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyogRGVjbGFyYXRpb25zICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXRJbnRlcmZhY2VEZWNsYXJhdGlvbiA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIC8vIFNob3J0ZW4gdGhlIG5vZGUgZnJvbSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJyB0byAnaW50ZXJmYWNlJ1xyXG4gICAgcmV0dXJuIHRoaXMudmlzaXRJbnRlcmZhY2Uobm9kZSwgcHJvcGVydGllcylcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmlzaXRJbnRlcmZhY2UgPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICAvLyBTaW5jZSAnaW50ZXJmYWNlJyBpcyBlbGVtZW50IGluIHRoZSBhcnJheVxyXG4gICAgLy8gd2UnbGwgbmVlZCB0byByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXkuXHJcbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xyXG4gICAgY29uc3QgaW50ZXJmYWNlXyA9IGNoaWxkcmVuLnNoaWZ0KCk7XHJcblxyXG4gICAgbGV0IGV4dGVuZHNfID0gZmFsc2UsIGltcGxlbWVudHNfID0gZmFsc2U7XHJcbiAgICBpZiAodGhpcy5oYXNJbmhlcml0YW5jZShub2RlKSkge1xyXG4gICAgICBjb25zdCBpbmhlcml0YW5jZSA9IHRoaXMuZ2V0SW5oZXJpdGFuY2VUeXBlKG5vZGUpXHJcbiAgICAgIGV4dGVuZHNfID0gaW5oZXJpdGFuY2UgPT09ICdleHRlbmRzJztcclxuICAgICAgaW1wbGVtZW50c18gPSBpbmhlcml0YW5jZSA9PT0gJ2ltcGxlbWVudHMnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5vZGVfID0gY3JlYXRlQVNUTm9kZShcclxuICAgICAgdGhpcy5zb3VyY2UsIFxyXG4gICAgICBub2RlLCBcclxuICAgICAgdGhpcy52aXNpdENoaWxkcmVuKGNoaWxkcmVuKSwgXHJcbiAgICAgIE9iamVjdC5hc3NpZ24ocHJvcGVydGllcyB8fCB7fSwge1xyXG4gICAgICBpbmhlcml0YW5jZToge1xyXG4gICAgICAgIGltcGxlbWVudHM6IGltcGxlbWVudHNfLFxyXG4gICAgICAgIGV4dGVuZHM6IGV4dGVuZHNfXHJcbiAgICAgIH0gYXMgTm9kZUluaGVyaXRhbmNlXHJcbiAgICB9KSk7XHJcbiAgICAvLyBPdmVyd3JpdGUgdGhlIG5vZGUgdHlwZSBmcm9tICdpbnRlcmZhY2VfZGVjbGFyYXRpb24nIHRvICdpbnRlcmZhY2UnXHJcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihub2RlXywgeyB0eXBlOiBpbnRlcmZhY2VfLnR5cGUgfSlcclxuICB9XHJcblxyXG4gIC8qIFNpZ25hdHVyZXMgKi9cclxuICBwcml2YXRlIHZpc2l0U2lnbmF0dXJlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbihub2RlLmNoaWxkcmVuKSwgcHJvcGVydGllcylcclxuICB9XHJcblxyXG4gIC8qIFR5cGVzICovXHJcblxyXG4gIHByaXZhdGUgdmlzaXRUeXBlTm9kZSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xyXG4gICAgICBjYXNlICd0eXBlX2lkZW50aWZpZXInOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0VGVybWluYWwobm9kZSlcclxuICAgICAgY2FzZSAndHlwZV9wYXJhbWV0ZXJzJzpcclxuICAgICAgY2FzZSAndHlwZV9wYXJhbWV0ZXInOlxyXG4gICAgICBjYXNlICd0eXBlX2Fubm90YXRpb24nOlxyXG4gICAgICBjYXNlICdwcmVkZWZpbmVkX3R5cGUnOlxyXG4gICAgICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbikpXHJcbiAgICAgIGNhc2UgJ29iamVjdF90eXBlJzpcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKHRoaXMuZmlsdGVyQ29tbWVudHMobm9kZSkpKVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyogT3RoZXIgbm9uLXRlcm1pbmFscyAqL1xyXG5cclxuICBwcml2YXRlIHZpc2l0Q29uc3RyYWludCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUuY2hpbGRyZW4pKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdEluaGVyaXRhbmNlQ2xhdXNlID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbikpXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHZpc2l0Rm9ybWFsUGFyYW10ZXJzID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbikpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdFJlcXVpcmVkUGFyYW1ldGVyID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbikpO1xyXG4gIH1cclxuICAvKiBUZXJtaW5hbHMgKi9cclxuXHJcbiAgcHJpdmF0ZSB2aXNpdFRlcm1pbmFsID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKVxyXG4gIH1cclxufSJdfQ==