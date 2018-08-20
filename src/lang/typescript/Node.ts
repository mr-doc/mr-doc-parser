import TextRange from "../../interfaces/TextRange";
import { SyntaxNode } from "tree-sitter";
import range from "../../utils/range";
import xdoc from 'xdoc-parser';
import { DocumentationNode } from 'xdoc-parser/src/XDocASTNode';
import { RemarkNode } from 'xdoc-parser/src/XDocParser';
import IFile from "../../interfaces/IFile";


export interface Node extends TextRange {
  text: string,
  properties?: Partial<NodeProperties>
  xdoc?: {
    markdown: RemarkNode,
    documentation: Partial<DocumentationNode>
  }
}

export function createNode(
  file: IFile, 
  node: SyntaxNode, 
  properties?: Partial<NodeProperties>,
  document?: boolean,
): Node {

  let node_ = { ...range(node), text: file.text.substring(node.startIndex, node.endIndex) }

  if (properties) {
    node_ = Object.assign(node_, { properties })
  }
  
  if (document) {
    node_ = Object.assign(node_, { xdoc: xdoc(node_.text).parse() })
  }
  return node_;
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