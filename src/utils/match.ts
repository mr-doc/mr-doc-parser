import { SyntaxNode } from "tree-sitter";

/**
 * Determines whether a node is a certain type.
 * ```
 * @param node: SyntaxNode - The node to compare.
 * @param type: string  - The node type to match.
 * @return: boolean
 * ```
 */
export default function match(node: SyntaxNode, ...types: string[]): boolean {
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (node.type === type) {
      return true;
    }
  }
  return false;
}