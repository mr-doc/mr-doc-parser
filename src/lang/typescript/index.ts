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
            // Perf: Possibly O(n^2)
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
    const classIdentifier = this.getNodeContext(children[0]);
    // Remove the identifier
    children = children.slice(1);

    const classProperties = Object.assign({
      implements: false,
      extends: false,
    }, properties);

    // Determine whether the class extends or implements
    if (children[0].type.match("class_heritage")) {
      if (this.getNodeContext(children[0]).text.includes("implements")) {
        classProperties.implements = true;
      } else if (this.getNodeContext(children[0]).text.includes("extends")) {
        classProperties.extends = true;
      }
      // Remove the heritage node
      children = children.slice(1);
    }

    let classBody: any = children[0];
    classBody = this.visitClassBody(classBody);
    // return {
    //   class: {
    //     name: 
    //   }
    // }
  }

  private visitClassBody(node: Parser.SyntaxNode) {
    const methods = [];
    // Perf: O(n)
    node.children.forEach(classChild => {
      if (classChild.type.match("comment") && this.isCStyleComment(classChild)) {
        const nextSibling = classChild.nextSibling;
        if (nextSibling) {
          switch (nextSibling.type) {
            case 'method_definition':
              methods.push(this.visitClassMethod(nextSibling, classChild));
              break;
            default:
              this.warnNotSupported(nextSibling);
              
              break;
          }
        }
      }
    });
    // console.log(JSON.stringify(methods[0], null, 2));
    
    return {
      methods,
    }
  }


  private visitClassMethod = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode
  ) => {
    let children = node.children;
    let isProperty = false;
    // Determine whether it is a property
    if (children[0].type.match("get")) {
      isProperty = true;
      // Remove the 'get' node
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
      context: this.getNodeContext(node)

    }
  }


  private visitNode = (node: Parser.SyntaxNode, leadingComment: Parser.SyntaxNode, properties: Partial<NodeProperties>) => {
    const context = this.getNodeContext(node);
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
    if (node.type.match("comment")) {
      return possibleTexts.map(text =>
        this.file.text
          .substring(node.startIndex, node.endIndex)
          .toLowerCase()
          .includes(text)
      ).includes(true);
    }
  }

  private getNodeContext(node: Parser.SyntaxNode) {
    return {
      ...location(node),
      text: this.file.text.substring(node.startIndex, node.endIndex)
    }
  }

  private warnNotSupported = (node: Parser.SyntaxNode) => {
    console.log(`[mr-doc::parser]: '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`);
  }
}
