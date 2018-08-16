import { SyntaxNode } from "tree-sitter";
import { createNode } from "../Node";

export function vistType(source:string, node: SyntaxNode) {
  switch(node.type) {
    case 'union_type':
      return visitUnionType(source, node);
    case 'intersection_type':
      return visitIntersectionType(source, node);
  }
}

export function visitUnionType(source: string, node: SyntaxNode) {
  return {
    union: {
      context: createNode(source, node)
    }
  }
}

export function visitIntersectionType(source: string, node:SyntaxNode) {
  
}