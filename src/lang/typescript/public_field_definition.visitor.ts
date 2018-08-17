import { SyntaxNode } from "tree-sitter";
import match from "../../utils/match";
import { text } from "../../utils/text";
import { visitType } from "./visitors/type.visitor";
import { createNode } from "./Node";

export function visitPublicFieldDefinition(source: string, node: SyntaxNode, comment: SyntaxNode) {
  let public_field_definition = node.children;
  let accessibility = 'public',
    identifier,
    type_annotation;

  if (match(public_field_definition[0], 'accessibility_modifier')) {
    accessibility = text(source, public_field_definition[0]);
    public_field_definition.shift();
  }

  if (match(public_field_definition[0], 'property_identifier')) {
    identifier = text(source, public_field_definition[0]);
    public_field_definition.shift();
  }

  if (match(public_field_definition[0], 'type_annotation')) {
    let type = public_field_definition[0].children[1];
    type_annotation = visitType(source, type);
  }
  return {
    type: 'property',
    context: createNode(source, node),
    comment: createNode(source, comment, null, true),
    identifier,
    accessibility,
    type_annotation
  }
}