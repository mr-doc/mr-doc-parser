import { createNode } from "../Node";
import { SyntaxNode } from "tree-sitter";
import { text } from "../../../utils/text";
import { visitType } from "./type.visitor";
import Source from "../../../interfaces/Source";
import match from "../../../utils/match";

export function visitPublicFieldDefinition(source: Source, node: SyntaxNode, comment: SyntaxNode) {
  let public_field_definition = node.children;
  let accessibility = 'public',
    identifier,
    type_annotation;

  if (match(public_field_definition[0], 'accessibility_modifier')) {
    accessibility = text(source, public_field_definition.shift());
  }

  if (match(public_field_definition[0], 'property_identifier')) {
    identifier = createNode(source, public_field_definition.shift());
  }

  if (match(public_field_definition[0], 'type_annotation')) {
    let type = public_field_definition.shift().children[1];
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