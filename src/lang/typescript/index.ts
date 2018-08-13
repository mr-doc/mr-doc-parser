import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import location from '../../utils/location';
import match from '../../utils/match';
import { NodeProperties, ClassNode, ClassBodyNode, ClassMethodNode, NodeContext } from './Node';


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

  /* Export node */

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

  /* Class Node */
  private visitClass = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode,
    properties: Partial<NodeProperties>
  ): ClassNode => {
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

  /* Interface Node */

  private visitInterfaceNode = (node: Parser.SyntaxNode, leadingComment: Parser.SyntaxNode, properties: Partial<NodeProperties>) => {
    let children = node.children;
    // Remove 'interface' since we already know that
    children = children.slice(1);
    // Get the interface identifier
    const interfaceIdentifier = this.getNodeContext(children[0]);
    // Remove the identifier
    children = children.slice(1);

    const interfaceProperties = Object.assign({
      // For consistency, we'll keep 'implements'
      implements: false,
      extends: false
    }, properties);

    let heritage = null;

    // Determine whether the class extends or implements
    if (match(children[0], 'class_heritage')) {
      if (this.getNodeContext(children[0]).text.includes("extends")) {
        interfaceProperties.extends = true;
      }
      // Store the heritage
      heritage = this.getNodeContext(children[0].children[0])
      // Remove the heritage node
      children = children.slice(1);
    }
    // console.log(children[0].children);
    let interfaceBody: any = children[0];
    interfaceBody = this.visitObjectTypeNode(interfaceBody);
    return {
      interface: {
        comment: this.getNodeContext(leadingComment),
        context: this.getNodeContext(node),
        identifier: interfaceIdentifier,
        heritage,
        body: interfaceBody,
        properties: interfaceProperties
      }
    }
  }


  private visitObjectTypeNode = (node: Parser.SyntaxNode) => {
    const methods = [];
    const properties = [];

    node.children.forEach(child => {
      if (match(child, 'comment') && this.isCStyleComment(child)) {
        const nextSibling = child.nextSibling;
        if (nextSibling) {
          switch (nextSibling.type) {
            case 'method_signature':
              methods.push(this.visitMethodSignature(nextSibling, child));
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
      properties
    }
  }

  private visitMethodSignature = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode
  ) => {
    const identifer = node.children[0];
    const call_signature = node.children[1];
    let call_signature_children = call_signature.children;
    let type_parameters = [];
    
    // Determine whether generics are used, such as myfunc<T>(...): T
    if (call_signature_children[0].type === 'type_parameters') {
      type_parameters = call_signature_children.map(this.getNodeContext.bind(this));
      call_signature_children = call_signature_children.slice(1);
    }

    // Note: An interface can have required and optional parameters
    // so we need to check later if a '?' exists
    let parameters: any = call_signature_children[0].children
      .map(this.getNodeContext.bind(this));
    // Remove parameters
    call_signature_children = call_signature_children.slice(1);

    // Get the type annotation for the method signature 
    let type_annotation: any = call_signature_children[0];
    // Determine if it does exists
    if (type_annotation && type_annotation.children[1]) {
      type_annotation = this.getNodeContext(type_annotation.children[1]);
    }
    return {
      identifier: this.getNodeContext(identifer),
      parameters,
      type_parameters,
      type_annotation
    }
  }

  private visitNode = (
    node: Parser.SyntaxNode,
    leadingComment: Parser.SyntaxNode,
    properties: Partial<NodeProperties>
  ) => {
    const context = this.getNodeContext(node);
    switch (node.type) {
      // Note: Export statemens may include 
      case 'export_statement':
        return this.visitExportStatement(node, leadingComment);
      case 'class':
        return this.visitClass(node, leadingComment, properties);
      // TODO: Complete interfaces and functions
      case 'interface_declaration':
        return this.visitInterfaceNode(node, leadingComment, properties);
        break;
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
