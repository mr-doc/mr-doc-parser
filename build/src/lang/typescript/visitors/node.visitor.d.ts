import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import IFile from "../../../interfaces/IFile";
export declare function visitNode(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): any;
