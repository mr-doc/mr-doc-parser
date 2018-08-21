import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitMethodDefinition(source: Source, node: SyntaxNode, comment: SyntaxNode): {
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
