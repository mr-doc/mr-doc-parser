import { SyntaxNode } from "tree-sitter";
import IFile from "../../interfaces/IFile";
export declare function visitPublicFieldDefinition(source: IFile, node: SyntaxNode, comment: SyntaxNode): {
    type: string;
    context: import("./Node").Node;
    comment: import("./Node").Node;
    identifier: any;
    accessibility: string;
    type_annotation: any;
};
