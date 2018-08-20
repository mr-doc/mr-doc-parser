import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import IFile from "../../../interfaces/IFile";
export declare function visitFunction(source: IFile, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): {
    type: string;
    context: import("../Node").Node;
    comment: import("../Node").Node;
    isAync: boolean;
    identifier: any;
    type_parameters: any;
    formal_parameters: any;
    type_annotation: any;
    properties: Partial<NodeProperties>;
};
