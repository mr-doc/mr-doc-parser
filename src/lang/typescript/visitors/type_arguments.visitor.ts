import { SyntaxNode } from "tree-sitter";
import { visitType } from "./type.visitor";

export function visitTypeArguments(source: string, node: SyntaxNode) {
    return node.children
    .filter(child => !child.type.match(/[<>,]/))
    .map(child => visitType(source, child))
}