import { isJavaDocComment } from "../../../utils/comment";
import { NodeProperties, createNode } from "../node";
import { SyntaxNode } from "tree-sitter";
import log, { ErrorType } from "../../../utils/log";
import match from "../../../utils/match";
import Source from "../../../interfaces/Source";
import visitTypeParameters, { visitTypeIdentifier, visitType } from "./type.visitor";
import { visitCallSignature } from "./signature.visitor";

export function visitClass(
  source: Source,
  node: SyntaxNode,
  comment: SyntaxNode,
  properties?: Partial<NodeProperties>
) {
  let children = node.children;
  // Remove 'class' from the array
  children.shift()
  const identifier = createNode(source, children.shift())
  const visited = children.map(child => {
    switch (child.type) {
      case 'type_parameters':
        return visitTypeParameters(source, child)
      case 'class_heritage':
        return visitClassHeritage(source, child)
      case 'class_body':
        return visitClassBody(source, child)
      default:
        log.report(source, node, ErrorType.NodeTypeNotYetSupported);
        break;
    }
  });

  const type_parameters = visited.filter(child => child.type === 'type_parameters').shift()
  const heritage = visited.filter(child => child.type === 'class_heritage').shift()
  const body = visited.filter(child => child.type === 'class_body').shift();

  return {
    type: 'class',
    identifier,
    type_parameters,
    heritage,
    body,
    properties,
    comment: createNode(source, comment, null, true),
    context: createNode(source, node)
  }
}

export function visitClassHeritage(source: Source, node: SyntaxNode) {
  let heritage_clause = node.children.shift();
  let heritage_clause_children = heritage_clause.children;
  // Remove the heritage type ('implements' or 'extends')
  let heritage_type = heritage_clause_children.shift();

  return {
    type: 'class_heritage',
    heritage_type: heritage_type.type,
    context: createNode(source, node),
    // A heritage is either 'implements' or 'extends'
    heritages: heritage_clause_children
      .filter(child => child.type === 'type_identifier')
      .map(child => visitTypeIdentifier(source, child))
  }
}

export function visitClassBody(source: Source, node: SyntaxNode) {

  const methods = []
  const properties = []
  node.children
    .filter(child => !child.type.match(/[{}]/))
    .forEach(child => {
      const nextSibling = child.nextSibling;
      if (match(child, 'comment') && isJavaDocComment(source, child)) {
        if (nextSibling) {
          switch (nextSibling.type) {
            case 'method_definition':
              methods.push(visitMethodDefinition(source, nextSibling, child));
              break;
            case 'public_field_definition':
              properties.push(visitPublicFieldDefinition(source, nextSibling, child));
              break;
            default:
              log.report(source, nextSibling, ErrorType.NodeTypeNotYetSupported);
              break;
          }
        }
      }
    });

  return {
    type: 'class_body',
    context: createNode(source, node),
    methods,
    properties
  }
}

export function visitMethodDefinition(source: Source, node: SyntaxNode, comment: SyntaxNode) {
  let method_definition = node.children;
  let accessibility,
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
    accessibility = createNode(source, method_definition.shift())
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

export function visitPublicFieldDefinition(source: Source, node: SyntaxNode, comment: SyntaxNode) {
  let public_field_definition = node.children;
  let accessibility,
    identifier,
    type_annotation;

  if (match(public_field_definition[0], 'accessibility_modifier')) {
    accessibility = createNode(source, public_field_definition.shift());
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