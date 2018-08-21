import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import Source from "../../../interfaces/Source";
export declare function visitDeclaration(source: Source, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): void;
export declare function visitInterfaceDeclaration(source: Source, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): void;
export declare function visitLexicalDeclaration(source: Source, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): void;
