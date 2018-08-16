import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import { visitClass } from "./class.visitor";
import range from "../../../utils/range";
import { visitExportStatement } from "./export_statement.visitor";

export function visitNode(
  source: string,
  node: SyntaxNode,
  comment: SyntaxNode,
  properties: Partial<NodeProperties>
) {
  switch (node.type) {
    // Note: Export statemens may include 
    case 'export_statement':
      return visitExportStatement(source, node, comment);
    case 'class':
      return visitClass(source, node, comment, properties);
    // TODO: Complete interfaces and functions
    // case 'interface_declaration':
      // return visitInterfaceDeclaration(node, comment, properties);
    // case 'function':
    // break;
    case 'comment':
      // noop
      break;
    case 'ERROR':
      const location = range(node).location;
      console.error(
        `[mr-doc::parser]: 'tree-sitter' was not able to parse at (${location.row.start + 1}:${location.column.start}).`
      )
      break;
    default:
      console.log(`[mr-doc::parser]: warning - '${node.type.replace(/[_]/g, ' ')}' is not supported yet.`);
      break;
  }
}