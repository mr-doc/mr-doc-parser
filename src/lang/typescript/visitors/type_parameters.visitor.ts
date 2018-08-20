import { SyntaxNode } from "tree-sitter";
import { createNode } from "../Node";
import IFile from "../../../interfaces/IFile";

export default function visitTypeParameters(source: IFile, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
    parameters: node.children
      .filter(child => !child.type.match(/[<>,]/))
      .map(child => ({ type: child.type, context: createNode(source, child) }))
  }
}