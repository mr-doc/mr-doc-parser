import IComment from "./interfaces/IComment";
import * as Parser from 'tree-sitter';
import xdoc from 'xdoc-parser';
import { Location, Position } from './interfaces/IComment';

/**
 * Creates a position object.
 * @param node: Parser.SyntaxNode
 * @param offset: {
 *  location: Location,
 *  position: Position
 * }
 */
function position(
  node: Parser.SyntaxNode,
  offset?: { location: Location, position: Position }
) {
  return {
    start: offset ? offset.position.start + node.startIndex : node.startIndex,
    end: offset ? offset.position.end + node.endIndex : node.endIndex
  }
}

/**
 * Creates a location object.
 * @param node: Parser.SyntaxNode
 * @param offset: {
 *  location: Location,
 *  position: Position
 * }
 * @return: {
 *  start: {
 *    row: number,
 *    column: number
 *  },
 *  end: {
 *    row: number,
 *    column: number
 *  }
 * }
 */
function location(
  node: Parser.SyntaxNode,
  offset: { location: Location, position: Position }
) {
  return {
    start: {
      row: offset ? offset.location.start.row + node.startPosition.row : node.startPosition.row,
      column: offset ? offset.location.start.column + node.startPosition.column : node.startPosition.column
    },
    end: {
      row: offset ? offset.location.end.row + node.endPosition.row : node.endPosition.row,
      column: offset ? offset.location.end.column + node.endPosition.column : node.endPosition.column
    }
  }
}

export default class CommentParser {
  static parse(
    node: Parser.SyntaxNode,
    source: string,
    offset?: { location: Location, position: Position },
    comments: IComment[] = [],
  ) {
    // console.log(node.type)
    if (node.type === "comment" && node.nextSibling) {
      console.log(node.nextSibling.type)
      // console.log(`${node.nextSibling.type} has a leading comment.`);
      const next = node.nextSibling;

      // console.log(source.substring(next.startIndex, next.endIndex));
      // console.log('');
      comments.push({
        position: position(node, offset),
        location: location(node, offset),
        markdown: (xdoc(source.substring(node.startIndex, node.endIndex), {
          visitor: {
            showNodeText: true
          }
        })).parse(),
        text: source.substring(node.startIndex, node.endIndex),
        context: {
          position: position(next, offset),
          location: location(next, offset),
          text: source.substring(next.startIndex, next.endIndex),
          type: next.type,
          children: []
        }
      });
    }

    node.children.forEach(child => CommentParser.parse(child, source, offset, comments));
    return comments;
  }
}