import { isJavaDocComment } from "../../../utils/comment";
import { NodeProperties, createNode } from "../Node";
import { SyntaxNode } from "tree-sitter";
import { visitMethodDefinition } from "./method_definition.visitor";
import { visitPublicFieldDefinition } from "./public_field_definition.visitor";
import { visitTypeIdentifier } from "./type.visitor";
import Source from "../../../interfaces/Source";
import log, { ErrorType } from "../../../utils/log";
import match from "../../../utils/match";
import visitTypeParameters from "./type_parameters.visitor";

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
        console.log(`[mr-doc::parser]: info - '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`)
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
              log.report(source, nextSibling, ErrorType.NodeTypeNotSupported);
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