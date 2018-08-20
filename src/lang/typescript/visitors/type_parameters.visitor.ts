import { createNode } from "../Node";
import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";

export default function visitTypeParameters(source: Source, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
    parameters: node.children
      .filter(child => !child.type.match(/[<>,]/))
      .map(child => ({ type: child.type, context: createNode(source, child) }))
  }
}