import { createASTNode, ASTNode } from "../common/ast";
import { isJavaDocComment, isLegalComment } from "../../utils/comment";
import { NodeProperties, NodeInheritance } from "../common/emca";
import { NodeVisitor } from "../common/node";
import { sibling } from "../../utils/sibling";
import { SyntaxNode } from "tree-sitter";
import * as _ from 'lodash';
import log, { ErrorType } from "../../utils/log";
import match from "../../utils/match";
import Source from "../../interfaces/Source";

/**
 * A class that visits ASTNodes from a TypeScript tree.
 */
export class TypeScriptVisitor implements NodeVisitor {
  private ast: ASTNode[] = []
  private source: Source
  constructor(source: Source) {
    this.source = source;
  }

  /**
   * Determines whether a node has inheritance
   */
  private hasInheritance(node: SyntaxNode) {
    let inherits = false;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (match(child, 'extends', 'implements')) {
        inherits = true;
      }
    }
    return inherits
  }

  /**
   * Returns a node's inheritance type
   */
  private getInheritanceType(node: SyntaxNode) {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (match(child, 'extends')) {
        return 'extends';
      }

      if (match(child, 'implements')) {
        return 'implements';
      }
    }
  }

  /**
   * Determines whether an export is default
   */
  private hasDefaultExport(node: SyntaxNode): boolean {
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (match(child, 'default')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns only the comments from a node's children.
   */
  private filterType(node: SyntaxNode, type: string): SyntaxNode[] {
    // console.time('filterType')
    let children: SyntaxNode[] = [];
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (match(child, type)) {
        children.push(child);
      }
    }
    // console.timeEnd('filterType')
    return children;
  }

  getAST(): ASTNode[] {
    return this.ast;
  }

  /* Visitors  */

  visitNode = (
    node: SyntaxNode,
    properties?: Partial<NodeProperties>
  ) => {
    switch (node.type) {
      case 'program':
        this.ast = this.visitProgram(node);
        break;
      case 'comment':
        return this.visitComment(node);
      case 'MISSING':
      case 'ERROR':
        log.report(this.source, node, ErrorType.TreeSitterParseError);
        break;
      default:

        /* Match other non-terminals */

        if (match(node,
          'constraint',
          'formal_parameters', 'required_parameter', 'rest_parameter',
          'type_identifier', 'type_parameters', 'type_parameter', 'type_annotation',
          'object_type', 'predefined_type', 'parenthesized_type', 'literal_type',
          'intersection_type', 'union_type',
          'class_body',
          'extends_clause',
          'unary_expression', 'binary_expression', 'member_expression',
          'statement_block', 'return_statement', 'export_statement', 'expression_statement',
          // A call_signature can also be a non-contextual node
          'call_signature',
          'internal_module',
          'variable_declarator',
          'object'
        )) {
          return this.visitNonTerminal(node, properties)
        }

        /* Match terminals */
        if (match(node,
          'identifier', 'extends', 'property_identifier', 'accessibility_modifier',
          'string', 'void', 'boolean', 'null', 'undefined', 'number', 'return',
          'get', 'function', 'namespace', 'const'
        )) {
          return this.visitTerminal(node);
        }
        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);
        break;
    }
  }

  visitChildren = (nodes: SyntaxNode[]): ASTNode[] => {
    let children: ASTNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.type.match(/[<>(){},:;\[\]&|=\+\-\*\/]/) && node.type !== '...') {
        const child = this.visitNode(node);
        if (child) children.push(child);
      }
    }
    return children;
  }

  private visitProgram = (node: SyntaxNode): ASTNode[] => {
    let visited = {},
      getStartLocation = (n: ASTNode) => `${n.location.row.start}:${n.location.column.start}`;
    // A program can have modules, namespaces, comments as its children
    // The first step is to parse all the comments in the root node
    let comments = this.visitChildren(this.filterType(node, 'comment'));
    // Parse the namespaces in expression_statement
    let namespaces = this.visitChildren(this.filterType(node, 'expression_statement'));
    // Parse the export statements in the root node
    let exports = this.visitChildren(this.filterType(node, 'export_statement'));

    // Get the visited context nodes
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const context = comment;
      visited[getStartLocation(context)] = true;
    }

    // Remove the visited nodes from namespaces array
    _.remove(namespaces, x => visited[getStartLocation(x)]);

    // Exports are oddballs since some exports may reference
    // a type/node that may have been commented.
    // We'll first need to filter the ones we have visited
    _.remove(exports, x => visited[getStartLocation(x)]);

    // From the ones we have not visited, we'll need to modify
    // the node properties of each context in a comment node that
    // matches the ones we have not visited.
    const matched = {};
    comments = _.compact(
      comments.map(comment => {
        for (let i = 0; i < exports.length; i++) {
          const export_ = exports[i];
          const context = comment.context;
          for (let j = 0; context && j < context.children.length; j++) {
            if (context.children[i] && context.children[i].type === export_.type) {
              matched[getStartLocation(export_)] = true;
              comment.context.properties = Object.assign(
                comment.context.properties || {},
                export_.properties
              );
            }
          }
        }
        return comment;
      }));

    // Removed the matched exports
    _.remove(exports, x => matched[getStartLocation(x)])

    return [].concat(comments).concat(namespaces).concat(exports);
  }

  private visitComment = (node: SyntaxNode): ASTNode => {
    if (isJavaDocComment(this.source, node) && !isLegalComment(this.source, node)) {
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
      case 'export_statement':
        return this.visitExportStatement(node, properties);
      case 'expression_statement':
        return this.visitExpressionStatement(node, properties);
      case 'class':
      case 'interface_declaration':
        return this.visitClassOrInterface(node, properties)
      case 'function':
      case 'call_signature':
      case 'method_signature':
      case 'property_signature':
      case 'public_field_definition':
      case 'method_definition':
      case 'lexical_declaration':
        return this.visitNonTerminal(node, properties);
      default:
        log.report(this.source, node, ErrorType.NodeTypeNotYetSupported);
        break;
    }
  }

  /* Statements */

  private visitExportStatement = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    let children = node.children, defaultExport = false;
    // Remove 'export' since it's always first in the array
    children.shift();
    if (this.hasDefaultExport(node)) {
      defaultExport = true;
      // Remove 'default' export
      children.shift();
    }
    const child = children.shift();
    return this.visitNode(child, { exports: { export: true, default: defaultExport } });
  }

  private visitExpressionStatement = (node: SyntaxNode, properties: Partial<NodeProperties>): ASTNode => {
    let children = node.children;
    const child = children.shift();

    if (match(child, 'internal_module')) {
      return this.visitInternalModule(child, properties)
    }

    if (match(child, 'function')) {
      if (properties) return this.visitContext(child, properties);
    }

    return this.visitNonTerminal(child)
  }

  /* Modules */

  private visitInternalModule = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    let children: ASTNode[] = node.children.map(child => {
      if (match(child, 'statement_block')) {
        return createASTNode(this.source, node, this.visitChildren(this.filterType(child, 'comment')))
      }
      return this.visitNode(child);
    });
    return createASTNode(this.source, node, children, Object.assign(properties || {}, { namespace: true }));
  }


  /* Declarations */

  private visitClassOrInterface = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    // Since 'interface' or 'class' is always first in the array
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

    if (match(node, 'class')) {
      return node_;
    }
    // Overwrite the node type from 'interface_declaration' to 'interface'
    return Object.assign(node_, { type: interface_.type })
  }

  /* Non-terminals */

  private visitNonTerminal = (node: SyntaxNode, properties?: Partial<NodeProperties>): ASTNode => {
    let children = node.children;
    // Handle special cases where some non-terminals
    // contain comments which is what we care about
    if (match(node, 'class_body', 'object_type')) {
      children = this.filterType(node, 'comment');
    }
    // Handle special cases where export statements have node properties
    if (match(node, 'export_statement')) {
      return this.visitExportStatement(node);
    }

    // Handle special cases where an internal module contains other nodes
    if (match(node, 'internal_module')) {
      return this.visitInternalModule(node, properties);
    }

    // Handle special cases where an intermal_module can exist in an expression_statement
    if (match(node, 'expression_statement')) {
      return this.visitExpressionStatement(node, properties);
    }

    if (match(node, 'function')) {
      _.remove(children, child => match(child, 'statement_block'))
      return createASTNode(this.source, node, this.visitChildren(children), properties);
    }

    return createASTNode(this.source, node, this.visitChildren(children), properties);
  }

  /* Terminals */

  private visitTerminal = (node: SyntaxNode): ASTNode => {
    return createASTNode(this.source, node)
  }
}