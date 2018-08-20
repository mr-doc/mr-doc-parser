import { SyntaxNode } from "tree-sitter";
import IFile from "../../../interfaces/IFile";
export declare function visitCallSignature(source: IFile, node: SyntaxNode): {
    type_parameters: any;
    formal_parameters: any;
    type_annotation: any;
};
