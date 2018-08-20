import { SyntaxNode } from "tree-sitter";
import IFile from "../../../interfaces/IFile";
export default function visitTypeParameters(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    parameters: {
        type: string;
        context: import("../Node").Node;
    }[];
};
