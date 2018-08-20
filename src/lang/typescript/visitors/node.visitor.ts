import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import { visitClass } from "./class.visitor";
import range from "../../../utils/range";
import { visitFunction } from "./function.visitor";
import log, { ErrorType } from '../../../utils/log';

import { visitInterfaceDeclaration, visitDeclaration } from "./declaration.visitor";
import { visitStatement } from "./statement.visitor";
import IFile from "../../../interfaces/IFile";

export function visitNode(
  source: IFile,
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
      
      log.report(source, node, ErrorType.NodeTypeNotSupported);
      break;
  }
}