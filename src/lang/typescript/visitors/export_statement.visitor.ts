import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import { visitNode } from "./node.visitor";
import match from "../../../utils/match";

export function visitExportStatement(
  source: string,
  node: SyntaxNode,
  comment: SyntaxNode,
) {
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
  return visitNode(source, child, comment, {
    exports: {
      export: true,
      default: isDefaultExport
    }
  });
}