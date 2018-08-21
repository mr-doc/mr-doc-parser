import { NodeProperties } from "../node";
import { SyntaxNode } from "tree-sitter";
import { visitNode } from "./node.visitor";
import Source from "../../../interfaces/Source";
import log, { ErrorType } from "../../../utils/log";
import match from "../../../utils/match";

export function visitStatement(
  source: Source,
  node: SyntaxNode,
  comment: SyntaxNode,
  properties: Partial<NodeProperties>
) {
  switch(node.type) {
    case 'expression_statement':
      return visitExpressionStatement(source, node, comment, properties);
    case 'export_statement':
      return visitExportStatement(source, node, comment);
    default:
      log.report(source, node, ErrorType.NodeTypeNotYetSupported);
      break;
  }
}

export function visitExpressionStatement(
  source: Source,
  node: SyntaxNode,
  comment: SyntaxNode,
  properties: Partial<NodeProperties>
) {
  return visitNode(source, node.children.shift(), comment, properties);
}

export function visitExportStatement(
  source: Source,
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