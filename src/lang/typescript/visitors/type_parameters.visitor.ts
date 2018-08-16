import { SyntaxNode } from "tree-sitter";
import { createNode } from "../Node";

export default function visitTypeParameters(source: string, node: SyntaxNode) {
  return {
    type: 'type_parameters',
    context: createNode(source, node),
    parameters: node.children
      .filter(child => !child.type.match(/[<>,]/))
      .map(child => ({ type: 'parameter', context: createNode(source, child) }))
  }
}