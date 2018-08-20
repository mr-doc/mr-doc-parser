import { SyntaxNode } from "tree-sitter";
import IFile from "../../../interfaces/IFile";
export declare function visitMethodDefinition(source: IFile, node: SyntaxNode, comment: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    comment: import("../Node").Node;
    accessibility: string;
    async: boolean;
    identifier: any;
    type_parameters: any;
    formal_parameters: any;
    type_annotation: any;
};
