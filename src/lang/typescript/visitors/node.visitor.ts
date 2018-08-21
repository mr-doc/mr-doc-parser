import { NodeProperties } from "../node";
import { SyntaxNode } from "tree-sitter";
import { visitClass } from "./class.visitor";
import { visitDeclaration } from "./declaration.visitor";
import { visitFunction } from "./function.visitor";
import { visitStatement } from "./statement.visitor";
import Source from "../../../interfaces/Source";
import log, { ErrorType } from '../../../utils/log';

export function visitNode(
  source: Source,
  node: SyntaxNode,
  comment: SyntaxNode,
  properties: Partial<NodeProperties>
) {
  switch (node.type) {
    case 'class':
      return visitClass(source, node, comment, properties);
    case 'function':
      return visitFunction(source, node, comment, properties);
    case 'comment':
      // noop
      break;
    case 'ERROR':
      log.report(source, node, ErrorType.TreeSitterParseError);
      break;
    default:
      if (node.type.includes("statement")) {
        return visitStatement(source, node, comment, properties);
      }

      if (node.type.includes("declaration")) {
        return visitDeclaration(source, node, comment, properties);
      }
      
      log.report(source, node, ErrorType.NodeTypeNotYetSupported);
      break;
  }
}