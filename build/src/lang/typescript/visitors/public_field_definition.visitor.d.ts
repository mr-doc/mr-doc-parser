import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitPublicFieldDefinition(source: Source, node: SyntaxNode, comment: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    comment: import("../Node").Node;
    identifier: any;
    accessibility: string;
    type_annotation: any;
};
