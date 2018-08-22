import { SyntaxNode } from "tree-sitter";
import { Node } from "../lang/typescript/visitor";

export default function walk(node: SyntaxNode) {
  let node_ = new Node(node);
  node_.syntaxNode.children.map(child => walk(child))
  return node_;
}