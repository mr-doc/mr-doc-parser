import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import IResult from '../../interfaces/IResult';
import CommentParser from '../../CommentParser';
import IComment from '../../interfaces/IComment';
import location from '../../utils/location';

interface NodeProperties {
  exports: {
    export: boolean,
    default: boolean
  }
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
  parse = (): IResult => {
    const tree = this.parser.parse(this.file.text);
    if (tree.rootNode.type === "program") {
      this.visitProgram(tree.rootNode)
    }

    return;
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
      node.children.forEach(child => {
        const nextSibling = child.nextSibling;
        // Determine if the node is a c-style comment
        if (child.type.match("comment") && this.isCStyleComment(child)) {
          // Determine whether a comment has a sibling
          if (nextSibling) {
            // Visit the sibling
            this.visitNode(nextSibling, child, {
              exports: {
                export: false,
                default: false
              }
            });
          }
        }
      });
    }
  }

  private visitExportStatement = (
    node: Parser.SyntaxNode, 
    leadingComment: Parser.SyntaxNode
  ) => {
    let isDefaultExport = false;
    // Remove the 'export' node
    let children = node.children.slice(1);
    if (node.children[1].type.match("default")) {
      isDefaultExport = true;
      // Remove the 'default' node
      children = children.slice(1);
    }
    // Most likely, the first index will point to the exported type
    const child = children[0];
    this.visitNode(child, leadingComment, {
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
  ) => {
    // console.log(node.children);
    let children = node.children;
    // Remove 'class' since we already know that
    children = children.slice(1);
    // Get the class/type identifier
    const classIdentifier = this.getContext(children[0]);
    // Remove the identifier
    children = children.slice(1);

    const classProperties = Object.assign({
      implements: false,
      extends: false,
    }, properties);

    // Determine whether the class extends or implements
    if (children[0].type.match("class_heritage")) {
      if (this.getContext(children[0]).text.includes("implements")) {
        classProperties.implements = true;
      } else if  (this.getContext(children[0]).text.includes("extends")) {
        classProperties.extends = true;
      }
      // Remove the heritage node
      children = children.slice(1);
    }

    const classBody = children[0];

    console.log(classBody.children);
    
    // return {
    //   class: {
    //     name: 
    //   }
    // }
  }


  private visitNode = (node: Parser.SyntaxNode, leadingComment: Parser.SyntaxNode, properties: Partial<NodeProperties>) => {
    const context = this.getContext(node);
    switch (node.type) {
      // Note: Export statemens may include 
      case 'export_statement':
        this.visitExportStatement(node, leadingComment);
        break;
      case 'class':
        this.visitClass(node, leadingComment, properties);
        break;
      case 'interface_declaration':
        break;
      case 'ERROR':
        console.error(
          `[mr-doc::parser]: 'tree-sitter' was not able to parse at row ${context.location.row.start + 1}.`
        )
        break;
      default:
        console.log(`[mr-doc::parser]: ${node.type} is not supported yet.`);

        break;
    }
  }
  /* Helpers */

  private isCStyleComment(node: Parser.SyntaxNode) {
    const comment = this.getContext(node).text;
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
    if (node.type.match("comment")) {
      return possibleTexts.map(text =>
        this.file.text
          .substring(node.startIndex, node.endIndex)
          .toLowerCase()
          .includes(text)
      ).includes(true);
    }
  }

  private getContext(node: Parser.SyntaxNode) {
    return {
      ...location(node),
      text: this.file.text.substring(node.startIndex, node.endIndex)
    }
  }
}
