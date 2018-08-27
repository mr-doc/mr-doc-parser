import { SyntaxNode } from "tree-sitter";

export function sibling(
  node: SyntaxNode,
  children?: SyntaxNode[],
  filter?: () => boolean
) {
  if (node) {
    if (children) {
      const index = filter ?
        children.filter(filter).indexOf(node) :
        children.indexOf(node);
      return children[index + 1];
    }
    return node.nextSibling;
  }
}