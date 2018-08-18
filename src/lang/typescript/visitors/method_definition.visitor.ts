import { SyntaxNode } from "tree-sitter";
import match from "../../../utils/match";
import { text } from "../../../utils/text";
import { createNode } from "../Node";
import { visitCallSignature } from "./call_signature.visitor";

export function visitMethodDefinition(source: string, node: SyntaxNode, comment: SyntaxNode) {
  let method_definition = node.children;
  let accessibility = 'public',
    isAsync = false,
    identifier,
    type_parameters,
    formal_parameters,
    type_annotation;

  if (match(method_definition[0], 'async')) {
    isAsync = true;
    method_definition.shift();
  }
  
  if (match(method_definition[0], 'accessibility_modifier')) {
    accessibility = text(source, method_definition.shift())
  }

  if (match(method_definition[0], 'property_identifier')) {
    identifier = createNode(source, method_definition.shift())
  }

  if (match(method_definition[0], 'call_signature')) {
    const call_signature = visitCallSignature(source, method_definition.shift())
    type_parameters = call_signature.type_parameters;
    formal_parameters = call_signature.formal_parameters;
    type_annotation = call_signature.type_annotation;
  }
  return {
    type: 'method',
    context: createNode(source, node),
    comment: createNode(source, node, null, true),
    accessibility,
    async: isAsync, 
    identifier,
    type_parameters,
    formal_parameters,
    type_annotation
  }
}