import { SyntaxNode } from "tree-sitter";
import { visitType } from "./type.visitor";
import IFile from "../../../interfaces/IFile";

export function visitTypeArguments(source: IFile, node: SyntaxNode) {
    return node.children
    .filter(child => !child.type.match(/[<>,]/))
    .map(child => visitType(source, child))
}