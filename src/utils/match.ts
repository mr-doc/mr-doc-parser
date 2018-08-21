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
  const matches = types.map(type => node && type === node.type);
  return matches.includes(true);
}