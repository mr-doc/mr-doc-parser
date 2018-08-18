import { SyntaxNode } from "tree-sitter";
import { visitNode } from "./node.visitor";
import match from "../../../utils/match";

export function visitExportStatement(
  source: string,
  node: SyntaxNode,
  comment: SyntaxNode,
) {
  let children = node.children,
    isDefaultExport = false;

  if (children.length > 1 && match(children.shift(), 'export')) {
  }

  if (children.length > 1 && match(children.shift(), 'default')) {
    isDefaultExport = true;
  }
  return visitNode(source, children.shift(), comment, {
    exports: {
      export: true,
      default: isDefaultExport
    }
  });
}