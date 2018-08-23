import { DocumentationNode } from 'xdoc-parser/src/XDocASTNode';
import { RemarkNode } from 'xdoc-parser/src/XDocParser';
import { SyntaxNode } from "tree-sitter";
import { text } from "../../utils/text";
import range from "../../utils/range";
import Source from "../../interfaces/Source";
import TextRange from "../../interfaces/TextRange";
import xdoc from 'xdoc-parser';
import * as _ from 'lodash'


export interface ASTNode extends TextRange {
  /**
   * @property - The type of node.
   */
  type: string,
  /**
   * @property - The context string.
   */
  text: string,
  /**
   * @property - The node's children.
   */
  children: ASTNode[] | undefined[],
  /**
   * @property - The context node that a comment node refers to.
   */
  context: ASTNode,
  /**
   * @property - The properties that a ASTNode may possess.
   */
  properties?: object
  /**
   * @property - The parsed XDoc comment.
   */
  comment?: {
    markdown: RemarkNode,
    documentation: Partial<DocumentationNode>
  }
}

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
