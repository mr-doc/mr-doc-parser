import { SyntaxNode } from "tree-sitter";
import match from "../../../utils/match";
import { text } from "../../../utils/text";
import { createNode } from "../Node";
import visitTypeParameters from "./type_parameters.visitor";
import { visitFormalParameters } from "./formal_parameters.visitor";
import { visitType } from "./type.visitor";

export function visitMethodDefinition(source: string, node: SyntaxNode, comment: SyntaxNode) {
  let method_definition = node.children;
  let accessibility = 'public',
    identifier,
    type_parameters,
    formal_parameters,
    type_annotation;
  
  if (match(method_definition[0], 'accessibility_modifier')) {
    accessibility = text(source, method_definition.shift())
  }

  if (match(method_definition[0], 'property_identifier')) {
    identifier = createNode(source, method_definition.shift())
  }

  if (match(method_definition[0], 'call_signature')) {
    let call_signature = method_definition.shift().children;

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
    
  }
  return {
    type: 'method',
    context: createNode(source, node),
    comment: createNode(source, node, null, true),
    identifier,
    accessibility,
    type_parameters,
    formal_parameters,
    type_annotation
  }
}