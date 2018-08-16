import { SyntaxNode } from "tree-sitter";
import match from "../../utils/match";
import { text } from "../../utils/text";

export function visitPublicFieldDefinition(source: string, node: SyntaxNode) {
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
    console.log(public_field_definition[0].children);
  }

}