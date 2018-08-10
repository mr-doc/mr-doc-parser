import * as Parser from 'tree-sitter';

export default function location(node: Parser.SyntaxNode) {
  return {
    position: {
      start: node.startIndex,
      end: node.endIndex
    },
    location: {
      row: { start: node.startPosition.row, end: node.endPosition.row },
      column: { start: node.startPosition.column, end: node.endPosition.column }
    }
  }
}