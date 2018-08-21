import { createASTNode, NodeProperties, NodeInheritance } from "../Node";
import { isJavaDocComment } from "../../../utils/comment";
import { sibling } from "../../../utils/sibling";
import { SyntaxNode } from "tree-sitter";
import { text } from "../../../utils/text";
import log, { ErrorType } from "../../../utils/log";
import match from "../../../utils/match";
import Source from "../../../interfaces/Source";
import xdoc from "xdoc-parser";


export interface TreeSitterNode {
  visit(visitor: NodeVisitor): void
}

export interface NodeVisitor {
  getAST(): object[]
  visitNode(node: SyntaxNode): any
  visitChildren(nodes: SyntaxNode[]): any
}

export class Node implements TreeSitterNode {
  constructor(public syntaxNode: SyntaxNode) { }
  visit = (visitor: NodeVisitor): NodeVisitor => {
    return visitor.visitNode(this.syntaxNode);
  }
}

export class TypeScriptVisitor implements NodeVisitor {
  private ast = []
  private source: Source
  private parent: SyntaxNode
  constructor(source: Source) {
    this.source = source;
  }
  private hasInheritance(node: SyntaxNode) {
    return node.children
      .filter(node => {
        return node.type === 'extends' || node.type === 'implements';
      }).length > 0
  }

  private getInheritanceType(node: SyntaxNode) {
    if (node.children.filter(node => node.type === 'extends')) {
      return 'extends';
    }

    if (node.children.filter(node => node.type === 'implements')) {
      return 'implements';
    }
  }

  getAST(): object[] {
    return this.ast;
  }
  /* Visitors  */
  visitNode = (
    node: SyntaxNode
  ) => {
    switch (node.type) {
      case 'program':
        this.parent = node;
        this.ast = this.visitProgram(node);
      case 'comment':
        return this.visitComment(node);
      case 'MISSING':
      case 'ERROR':
        log.report(this.source, node, ErrorType.TreeSitterParseError);
        break;
      default:

        /* Match other non-terminals */

        if (match(node, 'constraint')) {
          return this.visitConstraint(node)
        }

        if (match(node,
          'type_identifier', 'type_parameters', 'type_parameter',
          'object_type'
        )) {
          return this.visitTypeNode(node)
        }

        if (match(node, 'extends_clause')) {
          return this.visitInheritanceClause(node);
        }

        /* Match terminals */

        if (match(node, 'identifier', 'extends')) {
          return this.visitTerminal(node);
        }

        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);

        break;
    }
  }

  visitChildren = (nodes: SyntaxNode[]) => {
    return nodes
      .filter(child => !child.type.match(/[<>(){},;\[\]]/))
      .map(this.visitNode.bind(this))
      .filter(child => !!child);
  }

  visitProgram = (node: SyntaxNode) => {
    return this.visitChildren(node.children.filter(child => {
      return match(child, 'comment');
    }));
  }

  visitComment = (node: SyntaxNode) => {
    if (isJavaDocComment(this.source, node)) {
      const nextSibling = sibling(node);
      if (nextSibling) {
        return {
          type: node.type,
          ...createASTNode(this.source, node),
          context: this.visitContext(nextSibling, {}),
          comment: xdoc(text(this.source, node)).parse()
        }
      }
    }
  }

  visitContext = (node: SyntaxNode, properties?: Partial<NodeProperties>) => {
    switch (node.type) {
      case 'interface_declaration':
        this.parent = node;
        return this.visitInterfaceDeclaration(node, properties)
      case 'call_signature':
        return this.visitCallSignature(node, properties);
      default:
        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);
        break;
    }
  }

  /* Declarations */

  visitInterfaceDeclaration = (
    node: SyntaxNode,
    properties?: Partial<NodeProperties>
  ) => {
    // Shorten the node
    return this.visitInterface(node, properties)
  }

  visitInterface = (node: SyntaxNode, properties: Partial<NodeProperties>) => {
    let children = node.children;
    let extends_ = false, implements_ = false;
    if (this.hasInheritance(node)) {
      const inheritance = this.getInheritanceType(node)
      extends_ = inheritance === 'extends';
      implements_ = inheritance === 'implements';
    }
    Object.assign(properties, {
      inheritance: {
        implements: implements_,
        extends: extends_
      } as NodeInheritance
    })

    return {
      type: children.shift().type,
      ...createASTNode(this.source, node),
      children: this.visitChildren(children),
      properties
    }
  }

  /* Signatures */
  visitCallSignature = (node: SyntaxNode, properties: Partial<NodeProperties>) => {
    return {
      type: node.type,
      ...createASTNode(this.source, node),
      children: this.visitChildren(node.children),
      properties
    }
  }

  /* Types */

  visitTypeNode = (node: SyntaxNode) => {
    switch (node.type) {
      case 'type_identifier':
        return this.visitTerminal(node)
      case 'type_parameters':
        return {
          type: node.type,
          ...createASTNode(this.source, node),
          children: this.visitChildren(node.children),
        }
      case 'type_parameter':
        return {
          type: node.type,
          ...createASTNode(this.source, node),
          children: this.visitChildren(node.children)
        }
      case 'object_type':
        return {
          type: node.type,
          ...createASTNode(this.source, node),
          children: this.visitChildren(node.children.filter(child => {
            return match(child, 'comment')
          }))
        }
      default:
        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);
        break;

    }
  }

  /* Other non-terminals */

  visitConstraint = (node: SyntaxNode) => {
    return {
      type: node.type,
      ...createASTNode(this.source, node),
      children: this.visitChildren(node.children)
    }
  }

  visitInheritanceClause = (node: SyntaxNode) => {
    return {
      type: node.type,
      ...createASTNode(this.source, node),
      children: this.visitChildren(node.children)
    }
  }

  /* Terminals */

  visitTerminal = (node: SyntaxNode) => {
    return {
      type: node.type,
      ...createASTNode(this.source, node),
    }
  }
}