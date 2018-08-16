import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import { visitProgram } from './visitors/program.visitor';


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
      return visitProgram(this.source, tree.rootNode)
    }
  }

  /* Properties */

  private get source(): string {
    return this.file.text;
  }

  /* Visitors */

  /* Class Node */
  // private visitClass = (
  //   node: Parser.SyntaxNode,
  //   leadingComment: Parser.SyntaxNode,
  //   properties: Partial<NodeProperties>
  // ): ClassNode => {
  //   let children = node.children;
  //   // Remove 'class' since we already know that
  //   children = children.slice(1);
  //   // Get the class/type identifier
  //   const classIdentifier = this.getNodeContext(children[0]);
  //   // Remove the identifier
  //   children = children.slice(1);

  //   const classProperties = Object.assign({
  //     implements: false,
  //     extends: false,
  //   }, properties);
  //   let heritage = null;
  //   // Determine whether the class extends or implements
  //   if (match(children[0], 'class_heritage')) {
  //     if (this.getNodeContext(children[0]).text.includes("implements")) {
  //       classProperties.implements = true;
  //     } else if (this.getNodeContext(children[0]).text.includes("extends")) {
  //       classProperties.extends = true;
  //     }
  //     // Store the heritage
  //     heritage = this.getNodeContext(children[0].children[0])
  //     // Remove the heritage node
  //     children = children.slice(1);
  //   }

  //   let classBody: any = children[0];
  //   classBody = this.visitClassBody(classBody);
  //   return {
  //     class: {
  //       comment: this.getNodeContext(leadingComment),
  //       context: this.getNodeContext(node),
  //       identifier: classIdentifier,
  //       heritage,
  //       body: classBody,
  //     }
  //   }
  // }

  // private visitClassBody = (node: Parser.SyntaxNode) => {
  //   const methods = [];
  //   const properties = [];
  //   // Perf: O(n)
  //   node.children.forEach(classChild => {
  //     if (match(classChild, 'comment') && this.isCStyleComment(classChild)) {
  //       const nextSibling = classChild.nextSibling;
  //       if (nextSibling) {
  //         switch (nextSibling.type) {
  //           case 'method_definition':
  //             let method = visitClassMethod(nextSibling, classChild);
  //             if (method.type === 'method') {
  //               methods.push(method);
  //             } else if (method.type === 'property') {
  //               properties.push(method);
  //             }
  //             break;
  //           default:
  //             this.warnNotSupported(nextSibling);

  //             break;
  //         }
  //       }
  //     }
  //   });
  //   return {
  //     methods,
  //     properties,
  //   }
  // }

  // private visitClassMethod = (
  //   node: Parser.SyntaxNode,
  //   leadingComment: Parser.SyntaxNode
  // ): ClassMethodNode => {
  //   let children = node.children;
  //   let isPrivate = false, isProperty = false, isAsync = false;

  //   // Determine whether it is a private method
  //   if (match(children[0], 'accessibility_modifier')) {
  //     isPrivate = children[0].children[0].type === "private";
  //     // Remove 'private'
  //     children = children.slice(1);
  //   }

  //   // Determine whether it is a property
  //   if (match(children[0], 'get')) {
  //     isProperty = true;
  //     // Remove the 'get' node
  //     children = children.slice(1);
  //   }
  //   // Determine whether it is an async method
  //   if (match(children[0], 'async')) {
  //     isAsync = true;
  //     children = children.slice(1);
  //   }

  //   // Get the formal parameters
  //   const formal_parameters = children[1].children[0];
  //   const parameters = formal_parameters.children;
  //   // console.log(parameters);

  //   return {
  //     identifier: this.createNode(children[0]),
  //     // Note: parameters contains '(' ... ')'
  //     parameters: parameters.map(this.createNode.bind(this)),
  //     comment: this.createNode(leadingComment),
  //     context: this.createNode(node),
  //     type: isProperty ? 'property' : 'method',
  //     async: isAsync,
  //     private: isPrivate
  //   }
  // }

  /* Interface Node */

  // private visitInterfaceNode = (node: Parser.SyntaxNode, leadingComment: Parser.SyntaxNode, properties: Partial<NodeProperties>) => {
  //   let children = node.children;
  //   // Remove 'interface' since we already know that
  //   children = children.slice(1);
  //   // Get the interface identifier
  //   const interfaceIdentifier = this.createNode(children[0]);
  //   // Remove the identifier
  //   children = children.slice(1);

  //   const interfaceProperties = Object.assign({
  //     // For consistency, we'll keep 'implements'
  //     implements: false,
  //     extends: false
  //   }, properties);

  //   let heritage = null;

  //   // Determine whether the class extends or implements
  //   if (match(children[0], 'class_heritage')) {
  //     if (this.createNode(children[0]).text.includes("extends")) {
  //       interfaceProperties.extends = true;
  //     }
  //     // Store the heritage
  //     heritage = this.createNode(children[0].children[0])
  //     // Remove the heritage node
  //     children = children.slice(1);
  //   }
  //   // console.log(children[0].children);
  //   let interfaceBody: any = children[0];
  //   interfaceBody = this.visitObjectTypeNode(interfaceBody);
  //   return {
  //     interface: {
  //       comment: this.createNode(leadingComment),
  //       context: this.createNode(node),
  //       identifier: interfaceIdentifier,
  //       heritage,
  //       body: interfaceBody,
  //       properties: interfaceProperties
  //     }
  //   }
  // }


  // private visitObjectTypeNode = (node: Parser.SyntaxNode) => {
  //   const methods = [];
  //   const properties = [];

  //   node.children.forEach(child => {
  //     if (match(child, 'comment') && this.isCStyleComment(child)) {
  //       const nextSibling = child.nextSibling;
  //       if (nextSibling) {
  //         switch (nextSibling.type) {
  //           case 'method_signature':
  //             methods.push(this.visitMethodSignature(nextSibling, child));
  //             break;
  //           default:
  //             this.warnNotSupported(nextSibling);
  //             break;
  //         }
  //       }
  //     }
  //   });

  //   return {
  //     methods,
  //     properties
  //   }
  // }

  // private visitMethodSignature = (
  //   node: Parser.SyntaxNode,
  //   leadingComment: Parser.SyntaxNode
  // ) => {
  //   const identifer = node.children[0];
  //   const call_signature = node.children[1];
  //   let call_signature_children = call_signature.children;
  //   let type_parameters = [];

  //   // Determine whether generics are used, such as myfunc<T>(...): T
  //   if (call_signature_children[0].type === 'type_parameters') {
  //     type_parameters = call_signature_children.map(this.createNode.bind(this));
  //     call_signature_children = call_signature_children.slice(1);
  //   }

  //   // Note: An interface can have required and optional parameters
  //   // so we need to check later if a '?' exists
  //   let parameters: any = call_signature_children[0].children
  //     .map(this.createNode.bind(this));
  //   // Remove parameters
  //   call_signature_children = call_signature_children.slice(1);

  //   // Get the type annotation for the method signature 
  //   let type_annotation: any = call_signature_children[0];
  //   // Determine if it does exists
  //   if (type_annotation && type_annotation.children[1]) {
  //     type_annotation = this.createNode(type_annotation.children[1]);
  //   }
  //   return {
  //     identifier: this.createNode(identifer),
  //     parameters,
  //     type_parameters,
  //     type_annotation
  //   }
  // }
}
