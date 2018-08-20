import { SyntaxNode } from "tree-sitter";
import IFile from "../../../interfaces/IFile";
export declare function visitFormalParameters(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    parameters: {
        type: string;
        context: import("../Node").Node;
        identifier: any;
        type_annotation: any;
    }[];
};
export declare function visitRequiredParameter(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    identifier: any;
    type_annotation: any;
};
