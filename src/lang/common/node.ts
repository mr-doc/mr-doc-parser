import { SyntaxNode } from "tree-sitter";
import Visitor from "./visitor";

export interface TreeSitterNode {
  visit(visitor: Visitor): void
}

/**
 * A class that wraps a SyntaxNode as a Node
 */
export class Node implements TreeSitterNode {
  constructor(public syntaxNode: SyntaxNode) { }
  visit = (visitor: Visitor): void => {
    visitor.visitNode(this.syntaxNode);
  }
}