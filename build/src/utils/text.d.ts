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
export declare function text(source: Source, node: SyntaxNode): string;
