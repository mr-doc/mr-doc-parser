import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export default function visitTypeParameters(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    parameters: {
        type: string;
        context: import("../Node").Node;
    }[];
};
