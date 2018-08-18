import { SyntaxNode } from "tree-sitter";
import { visitNode } from "./node.visitor";
import { NodeProperties } from "../Node";

export function visitExpressionStatement(
    source: string, node: SyntaxNode, 
    comment: SyntaxNode, 
    properties: Partial<NodeProperties>
) {
    return visitNode(source, node.children.shift(), comment, properties);
}