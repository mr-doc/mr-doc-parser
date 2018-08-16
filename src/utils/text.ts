import { SyntaxNode } from "tree-sitter";

/**
 * Returns the context string
 * 
 * # API
 * 
 * @param source: string - The source string.
 * @param node: SyntaxNode - The syntax node.
 */
export function text(source: string, node: SyntaxNode) {
  return source.substring(node.startIndex, node.endIndex);
}