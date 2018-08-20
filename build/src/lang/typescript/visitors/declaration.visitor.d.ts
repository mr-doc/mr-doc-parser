import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import IFile from "../../../interfaces/IFile";
export declare function visitDeclaration(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): void;
export declare function visitInterfaceDeclaration(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): void;
export declare function visitLexicalDeclaration(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): void;
