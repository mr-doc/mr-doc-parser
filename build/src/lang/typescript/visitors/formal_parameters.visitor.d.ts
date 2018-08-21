import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitFormalParameters(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    parameters: {
        type: string;
        context: import("../Node").Node;
        identifier: any;
        type_annotation: any;
    }[];
};
export declare function visitRequiredParameter(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    identifier: any;
    type_annotation: any;
};
