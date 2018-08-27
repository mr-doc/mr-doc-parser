import { SyntaxNode } from "tree-sitter";
import Source from "../interfaces/Source";
export declare const XDocRegex: RegExp;
export declare function isLegalComment(source: Source, node: SyntaxNode): boolean;
export declare function isJavaDocComment(source: Source, node: SyntaxNode): boolean;
export declare function isXDocComment(source: string, node?: SyntaxNode): boolean;
export declare function isXDocCommentBlock(source: string, node: SyntaxNode): boolean;
export declare function isXDocCommentFragment(source: string, node: SyntaxNode): boolean;
