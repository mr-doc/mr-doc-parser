import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import IResult from '../../interfaces/IResult';
import CommentParser from '../../CommentParser';
import IComment from '../../interfaces/IComment';
import location, { Location } from '../../utils/location';
import match from '../../utils/match';

interface NodeProperties {
  exports: {
    export: boolean,
    default: boolean
  }
}

export interface NodeContext extends Location {
  text: string
}

export interface ClassNode {
  class: {
    comment: NodeContext,
    context: NodeContext,
    identifier: NodeContext,
    heritage: NodeContext,
    body: any[],
    properties: Partial<NodeProperties & {
      extends: boolean,
      implements: boolean
    }>
  }
}

export interface ClassBodyNode {
  methods: ClassMethodNode[],
  properties: any[]
}

export interface ClassMethodNode {
  identifier: NodeContext,
  // Note: parameters contains '(' ... ')'
  parameters: NodeContext[],
  comment: NodeContext,
  context: NodeContext,
  type: string,
  async: boolean,
  private: boolean
}

/**
 * A class that parses JavaScript comments.
 * 
 * # API
 * 
 * ```
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 * ```
 */
export default class TypeScriptParser implements IParser {
  private file: IFile;
  private options: any;
  private parser: Parser;
  constructor(file: IFile, options: any) {
    this.file = file;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }
  parse = () => {
    const tree = this.parser.parse(this.file.text);
    if (tree.rootNode.type === "program") {
      return this.visitProgram(tree.rootNode)
    }
  }

  /* Visitors */

  private visitProgram = (node: Parser.SyntaxNode) => {
    let children = node.children;
    if (node.children.length > 0) {
      if (this.isLegalComment(node.children[0])) {
        // Remove the legal comment from ast
        children = node.children.splice(1);
      }
      // Perf: O(n)
      return children.map(child => {
        const nextSibling = child.nextSibling;
        // Determine if the node is a c-style comment
        if (match(child, 'comment') && this.isCStyleComment(child)) {
          // Determine whether a comment has a sibling
          if (nextSibling) {
            // Visit the sibling
            // Perf: Possibly O(n^2)
            return this.visitNode(nextSibling, child, {
              exports: {
                export: false,
                default: false
              }
            });
          }
        }
      }).filter(child => !!child);
    }
  }

  private visitExportStatement = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode
  ) => {
    let isDefaultExport = false;
    // Remove the 'export' node
    let children = node.children.slice(1);
    if (match(node.children[1], 'default')) {
      isDefaultExport = true;
      // Remove the 'default' node
      children = children.slice(1);
    }
    // Most likely, the first index will point to the exported type
    const child = children[0];
    return this.visitNode(child, leadingComment, {
      exports: {
        export: true,
        default: isDefaultExport
      }
    });
  }

  private visitClass = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode,
    properties: Partial<NodeProperties>
  ): ClassNode => {
    // console.log(node.children);
    let children = node.children;
    // Remove 'class' since we already know that
    children = children.slice(1);
    // Get the class/type identifier
    const classIdentifier = this.getNodeContext(children[0]);
    // Remove the identifier
    children = children.slice(1);

    const classProperties = Object.assign({
      implements: false,
      extends: false,
    }, properties);
    let heritage = null;
    // Determine whether the class extends or implements
    if (match(children[0], 'class_heritage')) {
      if (this.getNodeContext(children[0]).text.includes("implements")) {
        classProperties.implements = true;
      } else if (this.getNodeContext(children[0]).text.includes("extends")) {
        classProperties.extends = true;
      }
      // Store the heritage
      heritage = this.getNodeContext(children[0].children[0])
      // Remove the heritage node
      children = children.slice(1);
    }

    let classBody: any = children[0];
    classBody = this.visitClassBody(classBody);
    return {
      class: {
        comment: this.getNodeContext(leadingComment),
        context: this.getNodeContext(node),
        identifier: classIdentifier,
        heritage,
        body: classBody,
        properties: classProperties
      }
    }
  }

  private visitClassBody = (node: Parser.SyntaxNode): ClassBodyNode => {
    const methods = [];
    const properties = [];
    // Perf: O(n)
    node.children.forEach(classChild => {
      if (match(classChild, 'comment') && this.isCStyleComment(classChild)) {
        const nextSibling = classChild.nextSibling;
        if (nextSibling) {
          switch (nextSibling.type) {
            case 'method_definition':
              let method = this.visitClassMethod(nextSibling, classChild);
              if (method.type === 'method') {
                methods.push(method);
              } else if (method.type === 'property') {
                properties.push(method);
              }
              break;
            default:
              this.warnNotSupported(nextSibling);

              break;
          }
        }
      }
    });
    return {
      methods,
      properties,
    }
  }

  private visitClassMethod = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode
  ): ClassMethodNode => {
    let children = node.children;
    let isPrivate = false, isProperty = false, isAsync = false;

    // Determine whether it is a private method
    if (match(children[0], 'accessibility_modifier')) {
      isPrivate = children[0].children[0].type === "private";
      // Remove 'private'
      children = children.slice(1);
    }

    // Determine whether it is a property
    if (match(children[0], 'get')) {
      isProperty = true;
      // Remove the 'get' node
      children = children.slice(1);
    }
    // Determine whether it is an async method
    if (match(children[0], 'async')) {
      isAsync = true;
      children = children.slice(1);
    }

    // Get the formal parameters
    const formal_parameters = children[1].children[0];
    const parameters = formal_parameters.children;
    // console.log(parameters);

    return {
      identifier: this.getNodeContext(children[0]),
      // Note: parameters contains '(' ... ')'
      parameters: parameters.map(this.getNodeContext.bind(this)),
      comment: this.getNodeContext(leadingComment),
      context: this.getNodeContext(node),
      type: isProperty ? 'property' : 'method',
      async: isAsync,
      private: isPrivate
    }
  }


  private visitNode = (node: Parser.SyntaxNode, leadingComment: Parser.SyntaxNode, properties: Partial<NodeProperties>) => {
    const context = this.getNodeContext(node);
    switch (node.type) {
      // Note: Export statemens may include 
      case 'export_statement':
        return this.visitExportStatement(node, leadingComment);
      case 'class':
        return this.visitClass(node, leadingComment, properties);
      // TODO: Complete interfaces and functions
      // case 'interface_declaration':
      //   break;
      // case 'function':
        // break;
      case 'comment':
        // noop
        break;
      case 'ERROR':
        console.error(
          `[mr-doc::parser]: 'tree-sitter' was not able to parse at row ${context.location.row.start + 1}.`
        )
        break;
      default:
        this.warnNotSupported(node);
        break;
    }
  }
  /* Helpers */

  private isCStyleComment(node: Parser.SyntaxNode) {
    const comment = this.getNodeContext(node).text;
    // https://blog.ostermiller.org/find-comment
    return comment.match(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/);
  }

  private isLegalComment = (node: Parser.SyntaxNode) => {
    const possibleTexts = [
      'copyright',
      'terms and conditions',
      'license',
      'all rights reserved'
    ];
    if (match(node, 'comment')) {
      return possibleTexts.map(text =>
        this.file.text
          .substring(node.startIndex, node.endIndex)
          .toLowerCase()
          .includes(text)
      ).includes(true);
    }
  }

  private getNodeContext(node: Parser.SyntaxNode): NodeContext {
    return {
      ...location(node),
      text: this.file.text.substring(node.startIndex, node.endIndex)
    }
  }

  private warnNotSupported = (node: Parser.SyntaxNode) => {
    console.log(`[mr-doc::parser]: warning - '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`);
  }
}
