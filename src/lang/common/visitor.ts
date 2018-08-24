import { SyntaxNode } from "tree-sitter";
import ASTNode from "../../interfaces/ASTNode";

export default abstract class Visitor {
  abstract getAST(): ASTNode[]
  abstract visitNode(node: SyntaxNode, properties?: object): ASTNode
  abstract visitChildren(nodes: SyntaxNode[], properties?: object): ASTNode[]
}