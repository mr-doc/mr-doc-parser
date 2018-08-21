import { createNode, NodeProperties } from "../node";
import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
import log, { ErrorType } from "../../../utils/log";
import match from "../../../utils/match";
import { isJavaDocComment } from "../../../utils/comment";
import { visitSignature } from "./signature.visitor";
import { sibling } from "../../../utils/sibling";

/* Type visitors */

export function visitTypeOrTypeIdentifier(source: Source, node: SyntaxNode) {
  if (match(node, 'type_identifier')) {
    return visitTypeIdentifier(source, node)
  }
  return visitType(source, node);
}

export function visitType(source: Source, node: SyntaxNode) {
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
      log.report(source, node, ErrorType.NodeTypeNotYetSupported);
      break;
  }
}

export function visitTypeIdentifier(source: Source, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node)
  }
}

export function visitUnionType(source: Source, node: SyntaxNode) {
  const union = node.children;
  return {
    type: node.type,
    context: createNode(source, node),
    left: visitTypeOrTypeIdentifier(source, union[0]),
    right: visitTypeOrTypeIdentifier(source, union[2])
  }
}

export function visitIntersectionType(source: Source, node: SyntaxNode) {
  const intersect = node.children;
  return {
    type: node.type,
    context: createNode(source, node),
    left: visitTypeOrTypeIdentifier(source, intersect[0]),
    right: visitTypeOrTypeIdentifier(source, intersect[2])
  }
}

export function visitParenthesizedType(source: Source, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
    parenthesized: visitTypeOrTypeIdentifier(source, node.children[1])
  }
}

export function visitGenericType(source: Source, node: SyntaxNode) {
  let children = node.children;
  return {
    type: node.type,
    context: createNode(source, node),
    generic: visitTypeIdentifier(source, children.shift()),
    type_arguments: visitTypeArguments(source, children.shift())
  }
}

export function visitPredefinedType(source: Source, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
  }
}

export function visitObjectType(
  source: Source,
  node: SyntaxNode,
  comment?: SyntaxNode,
  properties?: Partial<NodeProperties>
) {
  let children = node.children
    .filter(child => !child.type.match(/[\{\},;]/));
  let signatures = [];
  console.log(children)
  children.forEach(child => {
    let nextSibiling = sibling(child, children);
    if (match(child, 'comment') && isJavaDocComment(source, child) && nextSibiling) {
      // console.log(createNode(source, nextSibiling).text);
      // let signature = visitSignature(source, nextSibiling, child, properties);
      // if (signature) {
      //   signatures.push(signature)
      // }
    }
  });
  return {
    type: node.type,
    context: createNode(source, node),
    signatures
  }
}


/* Helpers */

export default function visitTypeParameters(source: Source, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
    parameters: node.children
      .filter(child => !child.type.match(/[<>,]/))
      .map(child => ({ type: child.type, context: createNode(source, child) }))
  }
}

export function visitTypeArguments(source: Source, node: SyntaxNode) {
  return node.children
    .filter(child => !child.type.match(/[<>,]/))
    .map(child => visitType(source, child))
}