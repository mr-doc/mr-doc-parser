"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const comment_1 = require("../../../utils/comment");
const sibling_1 = require("../../../utils/sibling");
const log_1 = require("../../../utils/log");
const match_1 = require("../../../utils/match");
const ast_1 = require("../../common/ast");
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
                    if (match_1.default(node, 'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation', 'object_type')) {
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
                    if (match_1.default(node, 'identifier', 'extends', 'property_identifier')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvcnMvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG9EQUEwRDtBQUMxRCxvREFBaUQ7QUFHakQsNENBQW9EO0FBQ3BELGdEQUF5QztBQUd6QywwQ0FBMEQ7QUFhMUQsTUFBYSxJQUFJO0lBQ2YsWUFBbUIsVUFBc0I7UUFBdEIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN6QyxVQUFLLEdBQUcsQ0FBQyxPQUFvQixFQUFRLEVBQUU7WUFDckMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFBO0lBSDRDLENBQUM7Q0FJL0M7QUFMRCxvQkFLQztBQUVELE1BQWEsaUJBQWlCO0lBSTVCLFlBQVksTUFBYztRQUhsQixRQUFHLEdBQWMsRUFBRSxDQUFBO1FBb0MzQixlQUFlO1FBQ2YsY0FBUyxHQUFHLENBQ1YsSUFBZ0IsRUFDaEIsRUFBRTtZQUNGLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDakIsS0FBSyxTQUFTO29CQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNuQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLEtBQUssU0FBUztvQkFDWixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssU0FBUyxDQUFDO2dCQUNmLEtBQUssT0FBTztvQkFDVixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUVFLCtCQUErQjtvQkFFL0IsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLFlB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QUFDO0lBRU8sY0FBYyxDQUFDLElBQWdCO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxlQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsQ0FBQztDQStKRjtBQW5NRCw4Q0FtTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb2RlUHJvcGVydGllcywgTm9kZUluaGVyaXRhbmNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lbWNhXCI7XHJcbmltcG9ydCB7IGlzSmF2YURvY0NvbW1lbnQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvY29tbWVudFwiO1xyXG5pbXBvcnQgeyBzaWJsaW5nIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3NpYmxpbmdcIjtcclxuaW1wb3J0IHsgU3ludGF4Tm9kZSB9IGZyb20gXCJ0cmVlLXNpdHRlclwiO1xyXG5pbXBvcnQgeyB0ZXh0IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3RleHRcIjtcclxuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbG9nXCI7XHJcbmltcG9ydCBtYXRjaCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWF0Y2hcIjtcclxuaW1wb3J0IFNvdXJjZSBmcm9tIFwiLi4vLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2VcIjtcclxuaW1wb3J0IHhkb2MgZnJvbSBcInhkb2MtcGFyc2VyXCI7XHJcbmltcG9ydCB7IGNyZWF0ZUFTVE5vZGUsIEFTVE5vZGUgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2FzdFwiO1xyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVHJlZVNpdHRlck5vZGUge1xyXG4gIHZpc2l0KHZpc2l0b3I6IE5vZGVWaXNpdG9yKTogdm9pZFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVWaXNpdG9yIHtcclxuICBnZXRBU1QoKTogQVNUTm9kZVtdXHJcbiAgdmlzaXROb2RlKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlXHJcbiAgdmlzaXRDaGlsZHJlbihub2RlczogU3ludGF4Tm9kZVtdKTogQVNUTm9kZVtdXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlIGltcGxlbWVudHMgVHJlZVNpdHRlck5vZGUge1xyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzeW50YXhOb2RlOiBTeW50YXhOb2RlKSB7IH1cclxuICB2aXNpdCA9ICh2aXNpdG9yOiBOb2RlVmlzaXRvcik6IHZvaWQgPT4ge1xyXG4gICAgdmlzaXRvci52aXNpdE5vZGUodGhpcy5zeW50YXhOb2RlKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUeXBlU2NyaXB0VmlzaXRvciBpbXBsZW1lbnRzIE5vZGVWaXNpdG9yIHtcclxuICBwcml2YXRlIGFzdDogQVNUTm9kZVtdID0gW11cclxuICBwcml2YXRlIHNvdXJjZTogU291cmNlXHJcbiAgcHJpdmF0ZSBwYXJlbnQ6IFN5bnRheE5vZGVcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSkge1xyXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIG5vZGUgaGFzIGluaGVyaXRhbmNlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBoYXNJbmhlcml0YW5jZShub2RlOiBTeW50YXhOb2RlKSB7XHJcbiAgICByZXR1cm4gbm9kZS5jaGlsZHJlblxyXG4gICAgICAuZmlsdGVyKG5vZGUgPT4ge1xyXG4gICAgICAgIHJldHVybiBub2RlLnR5cGUuaW5jbHVkZXMoJ2V4dGVuZHMnKSB8fCBub2RlLnR5cGUuaW5jbHVkZXMoJ2ltcGxlbWVudHMnKTtcclxuICAgICAgfSkubGVuZ3RoID4gMFxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5vZGUncyBpbmhlcml0YW5jZSB0eXBlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRJbmhlcml0YW5jZVR5cGUobm9kZTogU3ludGF4Tm9kZSkge1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4uZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlLmluY2x1ZGVzKCdleHRlbmRzJykpKSB7XHJcbiAgICAgIHJldHVybiAnZXh0ZW5kcyc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4uZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlLmluY2x1ZGVzKCdpbXBsZW1lbnRzJykpKSB7XHJcbiAgICAgIHJldHVybiAnaW1wbGVtZW50cyc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlckNvbW1lbnRzKG5vZGU6IFN5bnRheE5vZGUpIHtcclxuICAgIHJldHVybiBub2RlLmNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiBtYXRjaChjaGlsZCwgJ2NvbW1lbnQnKSk7XHJcbiAgfVxyXG5cclxuICBnZXRBU1QoKTogQVNUTm9kZVtdIHtcclxuICAgIHJldHVybiB0aGlzLmFzdDtcclxuICB9XHJcbiAgLyogVmlzaXRvcnMgICovXHJcbiAgdmlzaXROb2RlID0gKFxyXG4gICAgbm9kZTogU3ludGF4Tm9kZVxyXG4gICkgPT4ge1xyXG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcclxuICAgICAgY2FzZSAncHJvZ3JhbSc6XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBub2RlO1xyXG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XHJcbiAgICAgIGNhc2UgJ2NvbW1lbnQnOlxyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q29tbWVudChub2RlKTtcclxuICAgICAgY2FzZSAnTUlTU0lORyc6XHJcbiAgICAgIGNhc2UgJ0VSUk9SJzpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuVHJlZVNpdHRlclBhcnNlRXJyb3IpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG5cclxuICAgICAgICAvKiBNYXRjaCBvdGhlciBub24tdGVybWluYWxzICovXHJcblxyXG4gICAgICAgIGlmIChtYXRjaChub2RlLCAnY29uc3RyYWludCcpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbnN0cmFpbnQobm9kZSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxyXG4gICAgICAgICAgJ3R5cGVfaWRlbnRpZmllcicsICd0eXBlX3BhcmFtZXRlcnMnLCAndHlwZV9wYXJhbWV0ZXInLCAndHlwZV9hbm5vdGF0aW9uJyxcclxuICAgICAgICAgICdvYmplY3RfdHlwZScsXHJcbiAgICAgICAgKSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRUeXBlTm9kZShub2RlKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsICdleHRlbmRzX2NsYXVzZScpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdEluaGVyaXRhbmNlQ2xhdXNlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQSBjYWxsX3NpZ25hdHVyZSBjYW4gYWxzbyBiZSBhIG5vbi1jb250ZXh0dWFsIG5vZGVcclxuICAgICAgICBpZiAobWF0Y2gobm9kZSwgJ2NhbGxfc2lnbmF0dXJlJykpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0U2lnbmF0dXJlKG5vZGUpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiBNYXRjaCB0ZXJtaW5hbHMgKi9cclxuXHJcbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsICdpZGVudGlmaWVyJywgJ2V4dGVuZHMnLCAncHJvcGVydHlfaWRlbnRpZmllcicpKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFRlcm1pbmFsKG5vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbG9nLnJlcG9ydCh0aGlzLnNvdXJjZSwgbm9kZSwgRXJyb3JUeXBlLk5vZGVUeXBlTm90WWV0U3VwcG9ydGVkKTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2aXNpdENoaWxkcmVuID0gKG5vZGVzOiBTeW50YXhOb2RlW10pOiBBU1ROb2RlW10gPT4ge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgbm9kZXNcclxuICAgICAgICAuZmlsdGVyKGNoaWxkID0+ICFjaGlsZC50eXBlLm1hdGNoKC9bPD4oKXt9LDo7XFxbXFxdXS8pKVxyXG4gICAgICAgIC5tYXAodGhpcy52aXNpdE5vZGUuYmluZCh0aGlzKSkgYXMgQVNUTm9kZVtdXHJcbiAgICApLmZpbHRlcihjaGlsZCA9PiAhIWNoaWxkKTtcclxuICB9XHJcblxyXG4gIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZVtdID0+IHtcclxuICAgIHJldHVybiB0aGlzLnZpc2l0Q2hpbGRyZW4odGhpcy5maWx0ZXJDb21tZW50cyhub2RlKSk7XHJcbiAgfVxyXG5cclxuICB2aXNpdENvbW1lbnQgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xyXG4gICAgaWYgKGlzSmF2YURvY0NvbW1lbnQodGhpcy5zb3VyY2UsIG5vZGUpKSB7XHJcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZyhub2RlKTtcclxuICAgICAgaWYgKG5leHRTaWJsaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDb250ZXh0KG5leHRTaWJsaW5nLCB7fSksIHRydWUpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ2ludGVyZmFjZV9kZWNsYXJhdGlvbic6XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBub2RlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJmYWNlRGVjbGFyYXRpb24obm9kZSwgcHJvcGVydGllcylcclxuICAgICAgY2FzZSAnY2FsbF9zaWduYXR1cmUnOlxyXG4gICAgICBjYXNlICdtZXRob2Rfc2lnbmF0dXJlJzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdFNpZ25hdHVyZShub2RlLCBwcm9wZXJ0aWVzKTtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyogRGVjbGFyYXRpb25zICovXHJcblxyXG4gIHZpc2l0SW50ZXJmYWNlRGVjbGFyYXRpb24gPSAobm9kZTogU3ludGF4Tm9kZSwgcHJvcGVydGllcz86IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KTogQVNUTm9kZSA9PiB7XHJcbiAgICAvLyBTaG9ydGVuIHRoZSBub2RlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcclxuICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJmYWNlKG5vZGUsIHByb3BlcnRpZXMpXHJcbiAgfVxyXG5cclxuICB2aXNpdEludGVyZmFjZSA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pOiBBU1ROb2RlID0+IHtcclxuICAgIC8vIFNpbmNlICdpbnRlcmZhY2UnIGlzIGVsZW1lbnQgaW4gdGhlIGFycmF5XHJcbiAgICAvLyB3ZSdsbCBuZWVkIHRvIHJlbW92ZSBpdCBmcm9tIHRoZSBhcnJheS5cclxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XHJcbiAgICBjb25zdCBpbnRlcmZhY2VfID0gY2hpbGRyZW4uc2hpZnQoKTtcclxuXHJcbiAgICBsZXQgZXh0ZW5kc18gPSBmYWxzZSwgaW1wbGVtZW50c18gPSBmYWxzZTtcclxuICAgIGlmICh0aGlzLmhhc0luaGVyaXRhbmNlKG5vZGUpKSB7XHJcbiAgICAgIGNvbnN0IGluaGVyaXRhbmNlID0gdGhpcy5nZXRJbmhlcml0YW5jZVR5cGUobm9kZSlcclxuICAgICAgZXh0ZW5kc18gPSBpbmhlcml0YW5jZSA9PT0gJ2V4dGVuZHMnO1xyXG4gICAgICBpbXBsZW1lbnRzXyA9IGluaGVyaXRhbmNlID09PSAnaW1wbGVtZW50cyc7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgbm9kZV8gPSBjcmVhdGVBU1ROb2RlKFxyXG4gICAgICB0aGlzLnNvdXJjZSwgXHJcbiAgICAgIG5vZGUsIFxyXG4gICAgICB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLCBcclxuICAgICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzIHx8IHt9LCB7XHJcbiAgICAgIGluaGVyaXRhbmNlOiB7XHJcbiAgICAgICAgaW1wbGVtZW50czogaW1wbGVtZW50c18sXHJcbiAgICAgICAgZXh0ZW5kczogZXh0ZW5kc19cclxuICAgICAgfSBhcyBOb2RlSW5oZXJpdGFuY2VcclxuICAgIH0pKTtcclxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgbm9kZSB0eXBlIGZyb20gJ2ludGVyZmFjZV9kZWNsYXJhdGlvbicgdG8gJ2ludGVyZmFjZSdcclxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5vZGVfLCB7IHR5cGU6IGludGVyZmFjZV8udHlwZSB9KVxyXG4gIH1cclxuXHJcbiAgLyogU2lnbmF0dXJlcyAqL1xyXG4gIHZpc2l0U2lnbmF0dXJlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM/OiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPik6IEFTVE5vZGUgPT4ge1xyXG4gICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbihub2RlLmNoaWxkcmVuKSwgcHJvcGVydGllcylcclxuICB9XHJcblxyXG4gIC8qIFR5cGVzICovXHJcblxyXG4gIHZpc2l0VHlwZU5vZGUgPSAobm9kZTogU3ludGF4Tm9kZSk6IEFTVE5vZGUgPT4ge1xyXG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcclxuICAgICAgY2FzZSAndHlwZV9pZGVudGlmaWVyJzpcclxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdFRlcm1pbmFsKG5vZGUpXHJcbiAgICAgIGNhc2UgJ3R5cGVfcGFyYW1ldGVycyc6XHJcbiAgICAgIGNhc2UgJ3R5cGVfcGFyYW1ldGVyJzpcclxuICAgICAgY2FzZSAndHlwZV9hbm5vdGF0aW9uJzpcclxuICAgICAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSwgdGhpcy52aXNpdENoaWxkcmVuKG5vZGUuY2hpbGRyZW4pKVxyXG4gICAgICBjYXNlICdvYmplY3RfdHlwZSc6XHJcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUsIHRoaXMudmlzaXRDaGlsZHJlbih0aGlzLmZpbHRlckNvbW1lbnRzKG5vZGUpKSlcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qIE90aGVyIG5vbi10ZXJtaW5hbHMgKi9cclxuXHJcbiAgdmlzaXRDb25zdHJhaW50ID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbikpXHJcbiAgfVxyXG5cclxuICB2aXNpdEluaGVyaXRhbmNlQ2xhdXNlID0gKG5vZGU6IFN5bnRheE5vZGUpOiBBU1ROb2RlID0+IHtcclxuICAgIHJldHVybiBjcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlLCB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbikpXHJcbiAgfVxyXG5cclxuICAvKiBUZXJtaW5hbHMgKi9cclxuXHJcbiAgdmlzaXRUZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlKTogQVNUTm9kZSA9PiB7XHJcbiAgICByZXR1cm4gY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSlcclxuICB9XHJcbn0iXX0=