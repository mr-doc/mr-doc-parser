import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitCallSignature(source: Source, node: SyntaxNode): {
    type_parameters: any;
    formal_parameters: any;
    type_annotation: any;
};
