import { SyntaxNode } from "tree-sitter";
import { createNode } from "../Node";
import { visitTypeArguments } from "./type_arguments.visitor";

export function visitTypeOrTypeIdentifier(source: string, node: SyntaxNode) {
  if (node.type === 'type_identifier') {
    return visitTypeIdentifier(source, node)
  }
  return visitType(source, node);
}

export function visitType(source: string, node: SyntaxNode) {
  switch (node.type) {
    case 'union_type':
      return visitUnionType(source, node);
    case 'intersection_type':
      return visitIntersectionType(source, node);
    case 'parenthesized_type':
      return visitParenthesizedType(source, node);
    case 'type_identifier':
      return visitTypeIdentifier(source, node);
    case 'generic_type':
      return visitGenericType(source, node);
    case 'predefined_type':
      return visitPredefinedType(source, node);
    default:
    console.log(`[mr-doc::parser]: info - '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`);
    break;
  }
}

export function visitTypeIdentifier(source: string, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node)
  }
}

export function visitUnionType(source: string, node: SyntaxNode) {
  const union = node.children;
  return {
    type: node.type,
    context: createNode(source, node),
    left: visitTypeOrTypeIdentifier(source, union[0]),
    right: visitTypeOrTypeIdentifier(source, union[2])
  }
}

export function visitIntersectionType(source: string, node: SyntaxNode) {
  const intersect = node.children;
  return {
    type: node.type,
    context: createNode(source, node),
    left: visitTypeOrTypeIdentifier(source, intersect[0]),
    right: visitTypeOrTypeIdentifier(source, intersect[2])
  }
}

export function visitParenthesizedType(source: string, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
    parenthesized: visitTypeOrTypeIdentifier(source, node.children[1])
  }
}

export function visitGenericType(source: string, node: SyntaxNode) {
  let children = node.children;
  return {
    type: node.type,
    context: createNode(source, node),
    generic: visitTypeIdentifier(source, children.shift()),
    type_arguments: visitTypeArguments(source, children.shift())
  }
}

export function visitPredefinedType(source: string, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node.children.shift()),
  }
}