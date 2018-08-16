import TextRange from "../../interfaces/TextRange";
import { SyntaxNode } from "tree-sitter";
import range from "../../utils/range";

export interface Node extends TextRange {
  text: string,
  properties?: Partial<NodeProperties>
}

export function createNode(
  source: string, 
  node: SyntaxNode, 
  properties?: Partial<NodeProperties>
): Node {
  return {
    ...range(node),
    text: source.substring(node.startIndex, node.endIndex),
    properties
  }
}


export interface NodeProperties {
  exports: Partial<NodeExports>
  inheritance: Partial<NodeInheritance>
}

export interface NodeExports {
  export: boolean,
  default: boolean
}

export interface NodeInheritance {
  extends: boolean,
  implements: boolean
}

  // export interface ClassNode extends Node {
  //   class: {
  //     comment: Node,
  //     context: Node,
  //     identifier: Node,
  //     heritage: Node,
  //     body: any[]
  //   }
  // }

  // export interface ClassBodyNode {
  //   methods: ClassMethodNode[],
  //   properties: any[]
  // }

  // export interface ClassMethodNode {
  //   identifier: Node,
  //   // Note: parameters contains '(' ... ')'
  //   parameters: Node[],
  //   comment: Node,
  //   context: Node,
  //   type: string,
  //   async: boolean,
  //   private: boolean
  // }