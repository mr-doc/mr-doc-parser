import { SyntaxNode } from "tree-sitter";
import IFile from "../interfaces/IFile";
export declare const XDocRegex: RegExp;
export declare function isLegalComment(source: IFile, node: SyntaxNode): boolean;
export declare function isJavaDocComment(source: IFile, node: SyntaxNode): boolean;
export declare function isXDocComment(source: string, node?: SyntaxNode): boolean;
export declare function isXDocCommentBlock(source: string, node: SyntaxNode): boolean;
export declare function isXDocCommentFragment(source: string, node: SyntaxNode): boolean;
