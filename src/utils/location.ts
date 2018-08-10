import * as Parser from 'tree-sitter';

export interface Location {
  position: {
    start: number,
    end: number,
  }
  location: {
    row: { start: number, end: number },
    column: { start: number, end: number }
  }
}

export default function location(node: Parser.SyntaxNode): Location {
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