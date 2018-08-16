import { SyntaxNode } from "tree-sitter";
import { NodeProperties, createNode, NodeInheritance } from "../Node";
import { text } from "../../../utils/text";
import visitTypeParameters from "./type_parameters.visitor";
import match from "../../../utils/match";
import { isJavaDocComment } from "../../../utils/comment";
import { visitMethodDefinition } from "./method_definition.visitor";
import { visitPublicFieldDefinition } from "../public_field_definition.visitor";

export function visitClass(
  source: string,
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
        console.log(`[mr-doc::parser]: warning - '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`)
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
    comment: createNode(source, comment),
    context: createNode(source, node)
  }
}

export function visitClassHeritage(source: string, node: SyntaxNode) {
  let heritage_clause = node.children.shift();
  let heritage_clause_children = heritage_clause.children;
  // Remove the heritage type ('implements' or 'extends')
  let heritage_type = heritage_clause_children.shift();

  return {
    type: 'class_heritage',
    heritage_type: heritage_type.type,
    context: createNode(source, node),
    // A heritage is either 'implements' or 'extends'
    identifiers: heritage_clause_children
      .filter(child => child.type === 'type_identifier')
      .map(child => ({ type: 'identifier', context: createNode(source, child) }))
  }
}

export function visitClassBody(source: string, node: SyntaxNode) {

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
              return visitMethodDefinition(source, nextSibling);
            case 'public_field_definition':
              return visitPublicFieldDefinition(source, nextSibling);
            default:
              console.log(`[mr-doc::parser]: warning - '${nextSibling.type.replace(/[_]/g, ' ')}' is not supported yet.`)
              break;
          }
        }
      }
    })

  return {
    type: 'class_body',
    context: createNode(source, node),
  }
}