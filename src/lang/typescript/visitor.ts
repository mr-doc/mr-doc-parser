import { NodeProperties, NodeInheritance } from "../common/emca";
import { isJavaDocComment } from "../../utils/comment";
import { sibling } from "../../utils/sibling";
import { SyntaxNode } from "tree-sitter";
import { text } from "../../utils/text";
import log, { ErrorType } from "../../utils/log";
import match from "../../utils/match";
import Source from "../../interfaces/Source";
import xdoc from "xdoc-parser";
import { createASTNode, ASTNode } from "../common/ast";


export interface TreeSitterNode {
  visit(visitor: NodeVisitor): void
}

export interface NodeVisitor {
  getAST(): ASTNode[]
  visitNode(node: SyntaxNode): ASTNode
  visitChildren(nodes: SyntaxNode[]): ASTNode[]
}

export class Node implements TreeSitterNode {
  constructor(public syntaxNode: SyntaxNode) { }
  visit = (visitor: NodeVisitor): void => {
    visitor.visitNode(this.syntaxNode);
  }
}

export class TypeScriptVisitor implements NodeVisitor {
  private ast: ASTNode[] = []
  private source: Source
  private parent: SyntaxNode
  constructor(source: Source) {
    this.source = source;
  }
  /**
   * Determines whether a node has inheritance
   */
  private hasInheritance(node: SyntaxNode) {
    return node.children
      .filter(node => {
        return node.type.includes('extends') || node.type.includes('implements');
      }).length > 0
  }

  /**
   * Returns a node's inheritance type
   */
  private getInheritanceType(node: SyntaxNode) {
    if (node.children.filter(node => node.type.includes('extends'))) {
      return 'extends';
    }

    if (node.children.filter(node => node.type.includes('implements'))) {
      return 'implements';
    }
  }

  private filterComments(node: SyntaxNode) {
    return node.children.filter(child => match(child, 'comment'));
  }

  getAST(): ASTNode[] {
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

        if (match(node, 'formal_parameters')) {
          return this.visitFormalParamters(node);
        }

        if (match(node, 'required_parameter')) {
          return this.visitRequiredParameter(node);
        }

        if (match(node,
          'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation',
          'object_type', 'predefined_type'
        )) {
          return this.visitTypeNode(node)
        }

        if (match(node, 'extends_clause')) {
          return this.visitInheritanceClause(node);
        }

        // A call_signature can also be a non-contextual node
        if (match(node, 'call_signature')) {
          return this.visitSignature(node)
        }

        /* Match terminals */
        if (match(node, 
          'identifier', 'extends', 'property_identifier',
          'string', 'void', 'boolean', 'null', 'undefined', 'number'
        )) {
          return this.visitTerminal(node);
        }

        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);

        break;
    }
  }

  visitChildren = (nodes: SyntaxNode[]): ASTNode[] => {
    return (
      nodes
        .filter(child => !child.type.match(/[<>(){},:;\[\]]/))
        .map(this.visitNode.bind(this)) as ASTNode[]
    ).filter(child => !!child);
  }

  private visitProgram = (node: SyntaxNode): ASTNode[] => {
    return this.visitChildren(this.filterComments(node));
  }

  private visitComment = (node: SyntaxNode): ASTNode => {
    if (isJavaDocComment(this.source, node)) {
      const nextSibling = sibling(node);
      if (nextSibling) {
        return createASTNode(this.source, node, this.visitContext(nextSibling, {}), true)
      }
    }
  }

  /**
   * Visit the contextual node
   * 
   * # Remark
   * 
   * A node is considered contextual when a comment is visited and the node is its sibling.
   */
  private visitContext = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    switch (node.type) {
      case 'interface_declaration':
        this.parent = node;
        return this.visitInterfaceDeclaration(node, properties)
      case 'call_signature':
      case 'method_signature':
        return this.visitSignature(node, properties);
      default:
        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);
        break;
    }
  }

  /* Declarations */

  private visitInterfaceDeclaration = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    // Shorten the node from 'interface_declaration' to 'interface'
    return this.visitInterface(node, properties)
  }

  private visitInterface = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    // Since 'interface' is element in the array
    // we'll need to remove it from the array.
    let children = node.children;
    const interface_ = children.shift();

    let extends_ = false, implements_ = false;
    if (this.hasInheritance(node)) {
      const inheritance = this.getInheritanceType(node)
      extends_ = inheritance === 'extends';
      implements_ = inheritance === 'implements';
    }

    const node_ = createASTNode(
      this.source, 
      node, 
      this.visitChildren(children), 
      Object.assign(properties || {}, {
      inheritance: {
        implements: implements_,
        extends: extends_
      } as NodeInheritance
    }));
    // Overwrite the node type from 'interface_declaration' to 'interface'
    return Object.assign(node_, { type: interface_.type })
  }

  /* Signatures */
  private visitSignature = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    return createASTNode(this.source, node, this.visitChildren(node.children), properties)
  }

  /* Types */

  private visitTypeNode = (node: SyntaxNode): ASTNode => {
    switch (node.type) {
      case 'type_identifier':
        return this.visitTerminal(node)
      case 'type_parameters':
      case 'type_parameter':
      case 'type_annotation':
      case 'predefined_type':
        return createASTNode(this.source, node, this.visitChildren(node.children))
      case 'object_type':
        return createASTNode(this.source, node, this.visitChildren(this.filterComments(node)))
      default:
        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);
        break;

    }
  }

  /* Other non-terminals */

  private visitConstraint = (node: SyntaxNode): ASTNode => {
    return createASTNode(this.source, node, this.visitChildren(node.children))
  }

  private visitInheritanceClause = (node: SyntaxNode): ASTNode => {
    return createASTNode(this.source, node, this.visitChildren(node.children))
  }

  private visitFormalParamters = (node: SyntaxNode): ASTNode => {
    return createASTNode(this.source, node, this.visitChildren(node.children));
  }

  private visitRequiredParameter = (node: SyntaxNode): ASTNode => {
    return createASTNode(this.source, node, this.visitChildren(node.children));
  }
  /* Terminals */

  private visitTerminal = (node: SyntaxNode): ASTNode => {
    return createASTNode(this.source, node)
  }
}