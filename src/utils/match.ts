import { SyntaxNode } from "tree-sitter";

export default function match(node: SyntaxNode, type: string) {
  return node.type === type;
}