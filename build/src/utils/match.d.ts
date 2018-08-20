import { SyntaxNode } from "tree-sitter";
/**
 * Determines whether a node is a certain type.
 * ```
 * @param node: SyntaxNode - The node to compare.
 * @param type: string  - The node type to match.
 * @return: boolean
 * ```
 */
export default function match(node: SyntaxNode, type: string): boolean;
