import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import IFile from "../../../interfaces/IFile";
export declare function visitStatement(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): any;
export declare function visitExpressionStatement(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): any;
export declare function visitExportStatement(source: IFile, node: SyntaxNode, comment: SyntaxNode): any;
