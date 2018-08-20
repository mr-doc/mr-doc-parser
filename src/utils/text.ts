import { SyntaxNode } from "tree-sitter";
import IFile from "../interfaces/IFile";

/**
 * Returns the context string
 * 
 * # API
 * 
 * @param source: IFile - The source file.
 * @param node: SyntaxNode - The syntax node.
 */
export function text(source: IFile, node: SyntaxNode) {
  return source.text.substring(node.startIndex, node.endIndex);
}