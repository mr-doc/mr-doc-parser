import { SyntaxNode } from "tree-sitter";


export interface TreeSitterNode {
  visit(visitor: NodeVisitor): void
}

export interface NodeVisitor {
  visitNode(node: SyntaxNode): void
  visitChildren(nodes: SyntaxNode[]): void
}

export class Node implements TreeSitterNode {
  constructor(public syntaxNode: SyntaxNode) { }
  visit = (visitor: NodeVisitor): void => {
    visitor.visitNode(this.syntaxNode);
    visitor.visitChildren(this.syntaxNode.children);
  }
}

export class TypeScriptVisitor implements NodeVisitor {
  ast = []
  visitNode = (node: SyntaxNode): void => {
    switch (node.type) {
      case 'comment':
        this.ast.push(this.visitComment(node))
        break;
      default:
        break;
    }
  }

  visitChildren = (nodes: SyntaxNode[]): void => {
    nodes
      .filter(child => !child.type.match(/[<>(){},;\[\]]/))
      .forEach(this.visitNode.bind(this));
  }

  visitComment = (node: SyntaxNode): void => {

  }

}