import { SyntaxNode } from "tree-sitter";
import { createNode } from "../Node";

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
      
  }
}

export function visitTypeIdentifier(source: string, node: SyntaxNode) {
  return {
    type: 'type_identifier',
    context: createNode(source, node)
  }
}

export function visitUnionType(source: string, node: SyntaxNode) {
  const union = node.children;
  return {
    type: 'union_type',
    context: createNode(source, node),
    left: visitTypeOrTypeIdentifier(source, union[0]),
    right: visitTypeOrTypeIdentifier(source, union[2])
  }
}

export function visitIntersectionType(source: string, node: SyntaxNode) {
  const intersect = node.children;
  return {
    type: 'intersection_type',
    context: createNode(source, node),
    left: visitTypeOrTypeIdentifier(source, intersect[0]),
    right: visitTypeOrTypeIdentifier(source, intersect[2])
  }
}

export function visitParenthesizedType(source: string, node: SyntaxNode) {
  return {
    type: 'parenthesized_type',
    context: createNode(source, node),
    parenthesized: visitTypeOrTypeIdentifier(source, node.children[1])
  }
}