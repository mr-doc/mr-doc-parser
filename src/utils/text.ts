import { SyntaxNode } from "tree-sitter";
import Source from "../interfaces/Source";

/**
 * Returns the context string
 * 
 * # API
 * 
 * @param source: IFile - The source file.
 * @param node: SyntaxNode - The syntax node.
 */
export function text(source: Source, node: SyntaxNode) {
  return source.text.substring(node.startIndex, node.endIndex);
}