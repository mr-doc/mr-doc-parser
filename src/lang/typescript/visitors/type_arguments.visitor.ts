import { SyntaxNode } from "tree-sitter";
import { visitType } from "./type.visitor";
import Source from "../../../interfaces/Source";

export function visitTypeArguments(source: Source, node: SyntaxNode) {
    return node.children
    .filter(child => !child.type.match(/[<>,]/))
    .map(child => visitType(source, child))
}