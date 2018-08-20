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
export declare function text(source: IFile, node: SyntaxNode): string;
