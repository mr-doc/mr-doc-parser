import * as Parser from 'tree-sitter';
import TextRange from '../interfaces/TextRange';

export default function range(node: Parser.SyntaxNode): TextRange {
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