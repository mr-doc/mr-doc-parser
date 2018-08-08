import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-javascript';
import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import IResult from '../../interfaces/IResult';
import CommentParser from '../../CommentParser';
import IComment from '../../interfaces/IComment';

/**
 * A class that parses JavaScript comments.
 * 
 * # API
 * 
 * ```
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 * ```
 */
export default class TypeScriptParser implements IParser {
  private file: IFile;
  private options: any;
  private parser: Parser;
  constructor(file: IFile, options: any) {
    this.file = file;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }
  parse = (): IResult => {
    let tree = this.parser.parse(this.file.text);
    // Get the first comment
    let first_comment = tree.rootNode.children
      .filter(node => node.type === "comment")[0];
    const first_comment_string = this.file.text
    .substring(first_comment.startIndex, first_comment.endIndex);
    
    // Remove any legal or unncessary comments
    if (first_comment_string.includes("copyright") ||
      first_comment_string.includes("author") ||
      first_comment_string.includes("terms and conditions")) {
      tree.edit({
        startIndex: first_comment.startIndex,
        oldEndIndex: first_comment.endIndex,
        newEndIndex: first_comment.endIndex,
        startPosition: { row: 0, column: 0 },
        oldEndPosition: { row: 0, column: 0 },
        newEndPosition: { row: 0, column: 0 },
      });
      tree = this.parser.parse('', tree);
    }
    return {
      file: this.file,
      comments: CommentParser.parse(tree.rootNode, this.file.text)
        .filter(this.filterType)
        .map(this.parseChildren)
    }
  }

  private filterType = (comment: IComment): boolean => {
    return (this.options.filter ||
      [
        'function',
        'class',
        'variable_declaration'
      ]).includes(comment.context.type)
  }

  private parseChildren = (comment: IComment): IComment => {
    switch (comment.context.type) {
      case 'class':
        const tree = this.parser.parse(comment.context.text);
        comment.context.children = CommentParser.parse(
          tree.rootNode,
          comment.context.text,
          { location: comment.context.location, position: comment.context.position }
        ).filter(child => child.context.type === 'method_definition');
        break;
      default:
        break;
    }
    return comment;
  }
}