"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../Node");
const comment_1 = require("../../../utils/comment");
const sibling_1 = require("../../../utils/sibling");
const text_1 = require("../../../utils/text");
const log_1 = require("../../../utils/log");
const match_1 = require("../../../utils/match");
const xdoc_parser_1 = require("xdoc-parser");
class Node {
    constructor(syntaxNode) {
        this.syntaxNode = syntaxNode;
        this.visit = (visitor) => {
            return visitor.visitNode(this.syntaxNode);
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
                    if (match_1.default(node, 'type_identifier', 'type_parameters', 'type_parameter', 'object_type')) {
                        return this.visitTypeNode(node);
                    }
                    if (match_1.default(node, 'extends_clause')) {
                        return this.visitInheritanceClause(node);
                    }
                    /* Match terminals */
                    if (match_1.default(node, 'identifier', 'extends')) {
                        return this.visitTerminal(node);
                    }
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        this.visitChildren = (nodes) => {
            return nodes
                .filter(child => !child.type.match(/[<>(){},;\[\]]/))
                .map(this.visitNode.bind(this))
                .filter(child => !!child);
        };
        this.visitProgram = (node) => {
            return this.visitChildren(node.children.filter(child => {
                return match_1.default(child, 'comment');
            }));
        };
        this.visitComment = (node) => {
            if (comment_1.isJavaDocComment(this.source, node)) {
                const nextSibling = sibling_1.sibling(node);
                if (nextSibling) {
                    return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { context: this.visitContext(nextSibling, {}), comment: xdoc_parser_1.default(text_1.text(this.source, node)).parse() });
                }
            }
        };
        this.visitContext = (node, properties) => {
            switch (node.type) {
                case 'interface_declaration':
                    this.parent = node;
                    return this.visitInterfaceDeclaration(node, properties);
                case 'call_signature':
                    return this.visitCallSignature(node, properties);
                default:
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        /* Declarations */
        this.visitInterfaceDeclaration = (node, properties) => {
            // Shorten the node
            return this.visitInterface(node, properties);
        };
        this.visitInterface = (node, properties) => {
            let children = node.children;
            let extends_ = false, implements_ = false;
            if (this.hasInheritance(node)) {
                const inheritance = this.getInheritanceType(node);
                extends_ = inheritance === 'extends';
                implements_ = inheritance === 'implements';
            }
            Object.assign(properties, {
                inheritance: {
                    implements: implements_,
                    extends: extends_
                }
            });
            return Object.assign({ type: children.shift().type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(children), properties });
        };
        /* Signatures */
        this.visitCallSignature = (node, properties) => {
            return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(node.children), properties });
        };
        /* Types */
        this.visitTypeNode = (node) => {
            switch (node.type) {
                case 'type_identifier':
                    return this.visitTerminal(node);
                case 'type_parameters':
                    return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(node.children) });
                case 'type_parameter':
                    return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(node.children) });
                case 'object_type':
                    return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(node.children.filter(child => {
                            return match_1.default(child, 'comment');
                        })) });
                default:
                    log_1.default.report(this.source, node, log_1.ErrorType.NodeTypeNotYetSupported);
                    break;
            }
        };
        /* Other non-terminals */
        this.visitConstraint = (node) => {
            return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(node.children) });
        };
        this.visitInheritanceClause = (node) => {
            return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node), { children: this.visitChildren(node.children) });
        };
        /* Terminals */
        this.visitTerminal = (node) => {
            return Object.assign({ type: node.type }, Node_1.createASTNode(this.source, node));
        };
        this.source = source;
    }
    hasInheritance(node) {
        return node.children
            .filter(node => {
            return node.type === 'extends' || node.type === 'implements';
        }).length > 0;
    }
    getInheritanceType(node) {
        if (node.children.filter(node => node.type === 'extends')) {
            return 'extends';
        }
        if (node.children.filter(node => node.type === 'implements')) {
            return 'implements';
        }
    }
    getAST() {
        return this.ast;
    }
}
exports.TypeScriptVisitor = TypeScriptVisitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9sYW5nL3R5cGVzY3JpcHQvdmlzaXRvcnMvdmlzaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUF5RTtBQUN6RSxvREFBMEQ7QUFDMUQsb0RBQWlEO0FBRWpELDhDQUEyQztBQUMzQyw0Q0FBb0Q7QUFDcEQsZ0RBQXlDO0FBRXpDLDZDQUErQjtBQWEvQixNQUFhLElBQUk7SUFDZixZQUFtQixVQUFzQjtRQUF0QixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3pDLFVBQUssR0FBRyxDQUFDLE9BQW9CLEVBQWUsRUFBRTtZQUM1QyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQTtJQUg0QyxDQUFDO0NBSS9DO0FBTEQsb0JBS0M7QUFFRCxNQUFhLGlCQUFpQjtJQUk1QixZQUFZLE1BQWM7UUFIbEIsUUFBRyxHQUFHLEVBQUUsQ0FBQTtRQTBCaEIsZUFBZTtRQUNmLGNBQVMsR0FBRyxDQUNWLElBQWdCLEVBQ2hCLEVBQUU7WUFDRixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLEtBQUssU0FBUztvQkFDWixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDbkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLFNBQVM7b0JBQ1osT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxLQUFLLFNBQVMsQ0FBQztnQkFDZixLQUFLLE9BQU87b0JBQ1YsYUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDOUQsTUFBTTtnQkFDUjtvQkFFRSwrQkFBK0I7b0JBRS9CLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsRUFBRTt3QkFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO3FCQUNsQztvQkFFRCxJQUFJLGVBQUssQ0FBQyxJQUFJLEVBQ1osaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQ3RELGFBQWEsQ0FDZCxFQUFFO3dCQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtxQkFDaEM7b0JBRUQsSUFBSSxlQUFLLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEVBQUU7d0JBQ2pDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUMxQztvQkFFRCxxQkFBcUI7b0JBRXJCLElBQUksZUFBSyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDakM7b0JBRUQsYUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFFakUsTUFBTTthQUNUO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsa0JBQWEsR0FBRyxDQUFDLEtBQW1CLEVBQUUsRUFBRTtZQUN0QyxPQUFPLEtBQUs7aUJBQ1QsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUNwRCxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUE7UUFFRCxpQkFBWSxHQUFHLENBQUMsSUFBZ0IsRUFBRSxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDckQsT0FBTyxlQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUE7UUFFRCxpQkFBWSxHQUFHLENBQUMsSUFBZ0IsRUFBRSxFQUFFO1lBQ2xDLElBQUksMEJBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxXQUFXLEdBQUcsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsSUFBSSxXQUFXLEVBQUU7b0JBQ2YsdUJBQ0UsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQ1osb0JBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUNuQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQzNDLE9BQU8sRUFBRSxxQkFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQy9DO2lCQUNGO2FBQ0Y7UUFDSCxDQUFDLENBQUE7UUFFRCxpQkFBWSxHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUFvQyxFQUFFLEVBQUU7WUFDeEUsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixLQUFLLHVCQUF1QjtvQkFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTtnQkFDekQsS0FBSyxnQkFBZ0I7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbkQ7b0JBQ0UsYUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDakUsTUFBTTthQUNUO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsa0JBQWtCO1FBRWxCLDhCQUF5QixHQUFHLENBQzFCLElBQWdCLEVBQ2hCLFVBQW9DLEVBQ3BDLEVBQUU7WUFDRixtQkFBbUI7WUFDbkIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUM5QyxDQUFDLENBQUE7UUFFRCxtQkFBYyxHQUFHLENBQUMsSUFBZ0IsRUFBRSxVQUFtQyxFQUFFLEVBQUU7WUFDekUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QixJQUFJLFFBQVEsR0FBRyxLQUFLLEVBQUUsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUMxQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDakQsUUFBUSxHQUFHLFdBQVcsS0FBSyxTQUFTLENBQUM7Z0JBQ3JDLFdBQVcsR0FBRyxXQUFXLEtBQUssWUFBWSxDQUFDO2FBQzVDO1lBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3hCLFdBQVcsRUFBRTtvQkFDWCxVQUFVLEVBQUUsV0FBVztvQkFDdkIsT0FBTyxFQUFFLFFBQVE7aUJBQ0M7YUFDckIsQ0FBQyxDQUFBO1lBRUYsdUJBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLElBQ3hCLG9CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFDbkMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQ3RDLFVBQVUsSUFDWDtRQUNILENBQUMsQ0FBQTtRQUVELGdCQUFnQjtRQUNoQix1QkFBa0IsR0FBRyxDQUFDLElBQWdCLEVBQUUsVUFBbUMsRUFBRSxFQUFFO1lBQzdFLHVCQUNFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUNaLG9CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFDbkMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUMzQyxVQUFVLElBQ1g7UUFDSCxDQUFDLENBQUE7UUFFRCxXQUFXO1FBRVgsa0JBQWEsR0FBRyxDQUFDLElBQWdCLEVBQUUsRUFBRTtZQUNuQyxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLEtBQUssaUJBQWlCO29CQUNwQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2pDLEtBQUssaUJBQWlCO29CQUNwQix1QkFDRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFDWixvQkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQ25DLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFDNUM7Z0JBQ0gsS0FBSyxnQkFBZ0I7b0JBQ25CLHVCQUNFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUNaLG9CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFDbkMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUM1QztnQkFDSCxLQUFLLGFBQWE7b0JBQ2hCLHVCQUNFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUNaLG9CQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFDbkMsUUFBUSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQ3hELE9BQU8sZUFBSyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTt3QkFDaEMsQ0FBQyxDQUFDLENBQUMsSUFDSjtnQkFDSDtvQkFDRSxhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLGVBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUNqRSxNQUFNO2FBRVQ7UUFDSCxDQUFDLENBQUE7UUFFRCx5QkFBeUI7UUFFekIsb0JBQWUsR0FBRyxDQUFDLElBQWdCLEVBQUUsRUFBRTtZQUNyQyx1QkFDRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFDWixvQkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQ25DLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFDNUM7UUFDSCxDQUFDLENBQUE7UUFFRCwyQkFBc0IsR0FBRyxDQUFDLElBQWdCLEVBQUUsRUFBRTtZQUM1Qyx1QkFDRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFDWixvQkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQ25DLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFDNUM7UUFDSCxDQUFDLENBQUE7UUFFRCxlQUFlO1FBRWYsa0JBQWEsR0FBRyxDQUFDLElBQWdCLEVBQUUsRUFBRTtZQUNuQyx1QkFDRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFDWixvQkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQ3BDO1FBQ0gsQ0FBQyxDQUFBO1FBaE5DLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDTyxjQUFjLENBQUMsSUFBZ0I7UUFDckMsT0FBTyxJQUFJLENBQUMsUUFBUTthQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDYixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLElBQWdCO1FBQ3pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxFQUFFO1lBQ3pELE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLEVBQUU7WUFDNUQsT0FBTyxZQUFZLENBQUM7U0FDckI7SUFDSCxDQUFDO0lBRUQsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQixDQUFDO0NBNExGO0FBdE5ELDhDQXNOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUFTVE5vZGUsIE5vZGVQcm9wZXJ0aWVzLCBOb2RlSW5oZXJpdGFuY2UgfSBmcm9tIFwiLi4vTm9kZVwiO1xuaW1wb3J0IHsgaXNKYXZhRG9jQ29tbWVudCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9jb21tZW50XCI7XG5pbXBvcnQgeyBzaWJsaW5nIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3NpYmxpbmdcIjtcbmltcG9ydCB7IFN5bnRheE5vZGUgfSBmcm9tIFwidHJlZS1zaXR0ZXJcIjtcbmltcG9ydCB7IHRleHQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvdGV4dFwiO1xuaW1wb3J0IGxvZywgeyBFcnJvclR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbG9nXCI7XG5pbXBvcnQgbWF0Y2ggZnJvbSBcIi4uLy4uLy4uL3V0aWxzL21hdGNoXCI7XG5pbXBvcnQgU291cmNlIGZyb20gXCIuLi8uLi8uLi9pbnRlcmZhY2VzL1NvdXJjZVwiO1xuaW1wb3J0IHhkb2MgZnJvbSBcInhkb2MtcGFyc2VyXCI7XG5cblxuZXhwb3J0IGludGVyZmFjZSBUcmVlU2l0dGVyTm9kZSB7XG4gIHZpc2l0KHZpc2l0b3I6IE5vZGVWaXNpdG9yKTogdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5vZGVWaXNpdG9yIHtcbiAgZ2V0QVNUKCk6IG9iamVjdFtdXG4gIHZpc2l0Tm9kZShub2RlOiBTeW50YXhOb2RlKTogYW55XG4gIHZpc2l0Q2hpbGRyZW4obm9kZXM6IFN5bnRheE5vZGVbXSk6IGFueVxufVxuXG5leHBvcnQgY2xhc3MgTm9kZSBpbXBsZW1lbnRzIFRyZWVTaXR0ZXJOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN5bnRheE5vZGU6IFN5bnRheE5vZGUpIHsgfVxuICB2aXNpdCA9ICh2aXNpdG9yOiBOb2RlVmlzaXRvcik6IE5vZGVWaXNpdG9yID0+IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE5vZGUodGhpcy5zeW50YXhOb2RlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHlwZVNjcmlwdFZpc2l0b3IgaW1wbGVtZW50cyBOb2RlVmlzaXRvciB7XG4gIHByaXZhdGUgYXN0ID0gW11cbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZVxuICBwcml2YXRlIHBhcmVudDogU3ludGF4Tm9kZVxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSkge1xuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICB9XG4gIHByaXZhdGUgaGFzSW5oZXJpdGFuY2Uobm9kZTogU3ludGF4Tm9kZSkge1xuICAgIHJldHVybiBub2RlLmNoaWxkcmVuXG4gICAgICAuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgICByZXR1cm4gbm9kZS50eXBlID09PSAnZXh0ZW5kcycgfHwgbm9kZS50eXBlID09PSAnaW1wbGVtZW50cyc7XG4gICAgICB9KS5sZW5ndGggPiAwXG4gIH1cblxuICBwcml2YXRlIGdldEluaGVyaXRhbmNlVHlwZShub2RlOiBTeW50YXhOb2RlKSB7XG4gICAgaWYgKG5vZGUuY2hpbGRyZW4uZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlID09PSAnZXh0ZW5kcycpKSB7XG4gICAgICByZXR1cm4gJ2V4dGVuZHMnO1xuICAgIH1cblxuICAgIGlmIChub2RlLmNoaWxkcmVuLmZpbHRlcihub2RlID0+IG5vZGUudHlwZSA9PT0gJ2ltcGxlbWVudHMnKSkge1xuICAgICAgcmV0dXJuICdpbXBsZW1lbnRzJztcbiAgICB9XG4gIH1cblxuICBnZXRBU1QoKTogb2JqZWN0W10ge1xuICAgIHJldHVybiB0aGlzLmFzdDtcbiAgfVxuICAvKiBWaXNpdG9ycyAgKi9cbiAgdmlzaXROb2RlID0gKFxuICAgIG5vZGU6IFN5bnRheE5vZGVcbiAgKSA9PiB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3Byb2dyYW0nOlxuICAgICAgICB0aGlzLnBhcmVudCA9IG5vZGU7XG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy52aXNpdFByb2dyYW0obm9kZSk7XG4gICAgICBjYXNlICdjb21tZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaXRDb21tZW50KG5vZGUpO1xuICAgICAgY2FzZSAnTUlTU0lORyc6XG4gICAgICBjYXNlICdFUlJPUic6XG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5UcmVlU2l0dGVyUGFyc2VFcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcblxuICAgICAgICAvKiBNYXRjaCBvdGhlciBub24tdGVybWluYWxzICovXG5cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsICdjb25zdHJhaW50JykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdENvbnN0cmFpbnQobm9kZSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXRjaChub2RlLFxuICAgICAgICAgICd0eXBlX2lkZW50aWZpZXInLCAndHlwZV9wYXJhbWV0ZXJzJywgJ3R5cGVfcGFyYW1ldGVyJyxcbiAgICAgICAgICAnb2JqZWN0X3R5cGUnXG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdFR5cGVOb2RlKG5vZGUpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWF0Y2gobm9kZSwgJ2V4dGVuZHNfY2xhdXNlJykpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52aXNpdEluaGVyaXRhbmNlQ2xhdXNlKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogTWF0Y2ggdGVybWluYWxzICovXG5cbiAgICAgICAgaWYgKG1hdGNoKG5vZGUsICdpZGVudGlmaWVyJywgJ2V4dGVuZHMnKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnZpc2l0VGVybWluYWwobm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuXG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0Q2hpbGRyZW4gPSAobm9kZXM6IFN5bnRheE5vZGVbXSkgPT4ge1xuICAgIHJldHVybiBub2Rlc1xuICAgICAgLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQudHlwZS5tYXRjaCgvWzw+KCl7fSw7XFxbXFxdXS8pKVxuICAgICAgLm1hcCh0aGlzLnZpc2l0Tm9kZS5iaW5kKHRoaXMpKVxuICAgICAgLmZpbHRlcihjaGlsZCA9PiAhIWNoaWxkKTtcbiAgfVxuXG4gIHZpc2l0UHJvZ3JhbSA9IChub2RlOiBTeW50YXhOb2RlKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRDaGlsZHJlbihub2RlLmNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiB7XG4gICAgICByZXR1cm4gbWF0Y2goY2hpbGQsICdjb21tZW50Jyk7XG4gICAgfSkpO1xuICB9XG5cbiAgdmlzaXRDb21tZW50ID0gKG5vZGU6IFN5bnRheE5vZGUpID0+IHtcbiAgICBpZiAoaXNKYXZhRG9jQ29tbWVudCh0aGlzLnNvdXJjZSwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZyhub2RlKTtcbiAgICAgIGlmIChuZXh0U2libGluZykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgICAuLi5jcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKSxcbiAgICAgICAgICBjb250ZXh0OiB0aGlzLnZpc2l0Q29udGV4dChuZXh0U2libGluZywge30pLFxuICAgICAgICAgIGNvbW1lbnQ6IHhkb2ModGV4dCh0aGlzLnNvdXJjZSwgbm9kZSkpLnBhcnNlKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZpc2l0Q29udGV4dCA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz4pID0+IHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnaW50ZXJmYWNlX2RlY2xhcmF0aW9uJzpcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBub2RlO1xuICAgICAgICByZXR1cm4gdGhpcy52aXNpdEludGVyZmFjZURlY2xhcmF0aW9uKG5vZGUsIHByb3BlcnRpZXMpXG4gICAgICBjYXNlICdjYWxsX3NpZ25hdHVyZSc6XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2l0Q2FsbFNpZ25hdHVyZShub2RlLCBwcm9wZXJ0aWVzKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxvZy5yZXBvcnQodGhpcy5zb3VyY2UsIG5vZGUsIEVycm9yVHlwZS5Ob2RlVHlwZU5vdFlldFN1cHBvcnRlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qIERlY2xhcmF0aW9ucyAqL1xuXG4gIHZpc2l0SW50ZXJmYWNlRGVjbGFyYXRpb24gPSAoXG4gICAgbm9kZTogU3ludGF4Tm9kZSxcbiAgICBwcm9wZXJ0aWVzPzogUGFydGlhbDxOb2RlUHJvcGVydGllcz5cbiAgKSA9PiB7XG4gICAgLy8gU2hvcnRlbiB0aGUgbm9kZVxuICAgIHJldHVybiB0aGlzLnZpc2l0SW50ZXJmYWNlKG5vZGUsIHByb3BlcnRpZXMpXG4gIH1cblxuICB2aXNpdEludGVyZmFjZSA9IChub2RlOiBTeW50YXhOb2RlLCBwcm9wZXJ0aWVzOiBQYXJ0aWFsPE5vZGVQcm9wZXJ0aWVzPikgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgbGV0IGV4dGVuZHNfID0gZmFsc2UsIGltcGxlbWVudHNfID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuaGFzSW5oZXJpdGFuY2Uobm9kZSkpIHtcbiAgICAgIGNvbnN0IGluaGVyaXRhbmNlID0gdGhpcy5nZXRJbmhlcml0YW5jZVR5cGUobm9kZSlcbiAgICAgIGV4dGVuZHNfID0gaW5oZXJpdGFuY2UgPT09ICdleHRlbmRzJztcbiAgICAgIGltcGxlbWVudHNfID0gaW5oZXJpdGFuY2UgPT09ICdpbXBsZW1lbnRzJztcbiAgICB9XG4gICAgT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzLCB7XG4gICAgICBpbmhlcml0YW5jZToge1xuICAgICAgICBpbXBsZW1lbnRzOiBpbXBsZW1lbnRzXyxcbiAgICAgICAgZXh0ZW5kczogZXh0ZW5kc19cbiAgICAgIH0gYXMgTm9kZUluaGVyaXRhbmNlXG4gICAgfSlcblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBjaGlsZHJlbi5zaGlmdCgpLnR5cGUsXG4gICAgICAuLi5jcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKSxcbiAgICAgIGNoaWxkcmVuOiB0aGlzLnZpc2l0Q2hpbGRyZW4oY2hpbGRyZW4pLFxuICAgICAgcHJvcGVydGllc1xuICAgIH1cbiAgfVxuXG4gIC8qIFNpZ25hdHVyZXMgKi9cbiAgdmlzaXRDYWxsU2lnbmF0dXJlID0gKG5vZGU6IFN5bnRheE5vZGUsIHByb3BlcnRpZXM6IFBhcnRpYWw8Tm9kZVByb3BlcnRpZXM+KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgIC4uLmNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUpLFxuICAgICAgY2hpbGRyZW46IHRoaXMudmlzaXRDaGlsZHJlbihub2RlLmNoaWxkcmVuKSxcbiAgICAgIHByb3BlcnRpZXNcbiAgICB9XG4gIH1cblxuICAvKiBUeXBlcyAqL1xuXG4gIHZpc2l0VHlwZU5vZGUgPSAobm9kZTogU3ludGF4Tm9kZSkgPT4ge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICd0eXBlX2lkZW50aWZpZXInOlxuICAgICAgICByZXR1cm4gdGhpcy52aXNpdFRlcm1pbmFsKG5vZGUpXG4gICAgICBjYXNlICd0eXBlX3BhcmFtZXRlcnMnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgICAuLi5jcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKSxcbiAgICAgICAgICBjaGlsZHJlbjogdGhpcy52aXNpdENoaWxkcmVuKG5vZGUuY2hpbGRyZW4pLFxuICAgICAgICB9XG4gICAgICBjYXNlICd0eXBlX3BhcmFtZXRlcic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogbm9kZS50eXBlLFxuICAgICAgICAgIC4uLmNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUpLFxuICAgICAgICAgIGNoaWxkcmVuOiB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbilcbiAgICAgICAgfVxuICAgICAgY2FzZSAnb2JqZWN0X3R5cGUnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgICAgICAuLi5jcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKSxcbiAgICAgICAgICBjaGlsZHJlbjogdGhpcy52aXNpdENoaWxkcmVuKG5vZGUuY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaChjaGlsZCwgJ2NvbW1lbnQnKVxuICAgICAgICAgIH0pKVxuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2cucmVwb3J0KHRoaXMuc291cmNlLCBub2RlLCBFcnJvclR5cGUuTm9kZVR5cGVOb3RZZXRTdXBwb3J0ZWQpO1xuICAgICAgICBicmVhaztcblxuICAgIH1cbiAgfVxuXG4gIC8qIE90aGVyIG5vbi10ZXJtaW5hbHMgKi9cblxuICB2aXNpdENvbnN0cmFpbnQgPSAobm9kZTogU3ludGF4Tm9kZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBub2RlLnR5cGUsXG4gICAgICAuLi5jcmVhdGVBU1ROb2RlKHRoaXMuc291cmNlLCBub2RlKSxcbiAgICAgIGNoaWxkcmVuOiB0aGlzLnZpc2l0Q2hpbGRyZW4obm9kZS5jaGlsZHJlbilcbiAgICB9XG4gIH1cblxuICB2aXNpdEluaGVyaXRhbmNlQ2xhdXNlID0gKG5vZGU6IFN5bnRheE5vZGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogbm9kZS50eXBlLFxuICAgICAgLi4uY3JlYXRlQVNUTm9kZSh0aGlzLnNvdXJjZSwgbm9kZSksXG4gICAgICBjaGlsZHJlbjogdGhpcy52aXNpdENoaWxkcmVuKG5vZGUuY2hpbGRyZW4pXG4gICAgfVxuICB9XG5cbiAgLyogVGVybWluYWxzICovXG5cbiAgdmlzaXRUZXJtaW5hbCA9IChub2RlOiBTeW50YXhOb2RlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgIC4uLmNyZWF0ZUFTVE5vZGUodGhpcy5zb3VyY2UsIG5vZGUpLFxuICAgIH1cbiAgfVxufSJdfQ==