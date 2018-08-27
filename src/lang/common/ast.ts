import { SyntaxNode } from "tree-sitter";
import { text } from "../../utils/text";
import range from "../../utils/range";
import Source from "../../interfaces/Source";
import xdoc from 'xdoc-parser';
import * as _ from 'lodash'
import ASTNode from "../../interfaces/ASTNode";

export function isASTNode(object: object): object is ASTNode {
  return object && 'type' in object && 'text' in object && 'children' in object;
}

export function createASTNode(source: Source, node: SyntaxNode): ASTNode
export function createASTNode(source: Source, node: SyntaxNode, properties: object)
export function createASTNode(source: Source, node: SyntaxNode, children: object[]): ASTNode
export function createASTNode(source: Source, node: SyntaxNode, children: object[], properties: object)
export function createASTNode(source: Source, node: SyntaxNode, context: ASTNode, document: boolean): ASTNode
export function createASTNode(source: Source, node: SyntaxNode, arg1?: any, arg2?: any): ASTNode {

  let context, children = [], document = typeof arg2 === 'boolean' && arg2 === true, properties;

  if (_.isPlainObject(arg1) && !isASTNode(arg1)) {
    properties = arg1;
  } else if (_.isPlainObject(arg1) && isASTNode(arg1)) {
    context = arg1;
  } else if (_.isArray(arg1)) {
    children = arg1;
  }

  if (_.isPlainObject(arg2)) {
    properties = arg2;
  }

  return {
    type: node.type,
    text: text(source, node),
    ...range(node),
    context,
    children,
    comment: document ? xdoc(source.text).parse() : undefined,
    properties,
  }
}
