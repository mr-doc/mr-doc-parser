import { ASTNode } from "./ast";
import { SyntaxNode } from "tree-sitter";

export interface TreeSitterNode {
  visit(visitor: NodeVisitor): void
}

export interface NodeVisitor {
  getAST(): ASTNode[]
  visitNode(node: SyntaxNode, properties?: object): ASTNode
  visitChildren(nodes: SyntaxNode[], properties?: object): ASTNode[]
}

export class Node implements TreeSitterNode {
  constructor(public syntaxNode: SyntaxNode) { }
  visit = (visitor: NodeVisitor): void => {
    visitor.visitNode(this.syntaxNode);
  }
}