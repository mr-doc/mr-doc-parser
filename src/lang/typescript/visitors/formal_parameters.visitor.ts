import { createNode } from "../Node";
import { SyntaxNode } from "tree-sitter";
import { text } from "../../../utils/text";
import { visitType } from "./type.visitor";
import Source from "../../../interfaces/Source";
import match from "../../../utils/match";

export function visitFormalParameters(source: Source, node: SyntaxNode) {
  return {
    type: node.type,
    context: createNode(source, node),
    parameters: node.children
    .filter(child => !child.type.match(/[(),]/))
    .map(child => visitRequiredParameter(source, child))
  }
}


export function visitRequiredParameter(source: Source, node: SyntaxNode) {
  let required_parameter = node.children,
    identifier,
    type_annotation;
    

  if (match(required_parameter[0], 'identifier')) {
    identifier = text(source, required_parameter.shift());
  }

  if(match(required_parameter[0], 'type_annotation')) {
    let type = required_parameter.shift().children[1];
    type_annotation = visitType(source, type); 
  }

  return {
    type: 'parameter',
    context: createNode(source, node),
    identifier,
    type_annotation
  }
}