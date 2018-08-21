import { NodeProperties, createNode } from "../Node";
import { SyntaxNode } from "tree-sitter";
import { visitFormalParameters } from "./formal_parameters.visitor";
import match from "../../../utils/match";
import Source from "../../../interfaces/Source";
import visitTypeParameters, { visitType } from "./type.visitor";
import log, { ErrorType } from "../../../utils/log";

export function visitSignature(
  source: Source,
  node: SyntaxNode,
  comment?: SyntaxNode,
  properties?: Partial<NodeProperties>
) {
  switch (node.type) {
    case 'call_signature':
      return visitCallSignature(source, node, comment, properties);
    case 'method_signature':
      return visitMethodSignature(source, node, comment, properties);
    default:
      log.report(source, node, ErrorType.NodeTypeNotYetSupported);
      break;
  }
}

export function visitCallSignature(
  source: Source,
  node: SyntaxNode,
  comment?: SyntaxNode,
  properties?: Partial<NodeProperties>
) {

  let call_signature = node.children,
    type_parameters,
    formal_parameters,
    type_annotation;

  if (match(call_signature[0], 'type_parameters')) {
    type_parameters = visitTypeParameters(source, call_signature.shift());
  }

  if (match(call_signature[0], 'formal_parameters')) {
    formal_parameters = visitFormalParameters(source, call_signature.shift());
  }

  if (match(call_signature[0], 'type_annotation')) {
    let type = call_signature.shift().children[1];
    type_annotation = visitType(source, type);
  }

  return {
    type: node.type,
    context: createNode(source, node),
    comment: comment ? createNode(source, comment, null, true) : undefined,
    properties,
    type_parameters,
    formal_parameters,
    type_annotation
  }
}


export function visitMethodSignature(
  source: Source,
  node: SyntaxNode,
  comment: SyntaxNode,
  properties: Partial<NodeProperties>
) {
  let children = node.children,
    identifier;
  if(match(children[0], 'property_identifier')) {
    identifier = createNode(source, children.shift());
  }
  console.log(children);
  
  // console.log(children[0].type, createNode(source, children[0]).text)
}

export function visitPropertySignature(
  source: Source,
  node: SyntaxNode,
  comment?: SyntaxNode,
  properties?: Partial<NodeProperties>
) {
  // console.log(node)
  return {
    type: node.type,
    context: createNode(source, node),
    comment: comment ? createNode(source, comment, null, true) : undefined,
  }
}