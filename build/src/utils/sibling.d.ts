import { SyntaxNode } from "tree-sitter";
export declare function sibling(node: SyntaxNode, children?: SyntaxNode[], filter?: () => boolean): SyntaxNode;
