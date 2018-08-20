import * as Parser from 'tree-sitter';
import * as JavaScript from 'tree-sitter-javascript';
import IParser from '../../interfaces/IParser';
import Source from '../../interfaces/Source';
// import IResult from '../../interfaces/IResult';
// import IComment from '../../interfaces/IComment';

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
export default class JavaScriptParser implements IParser {
  private file: Source;
  private options: any;
  private parser: Parser;
  constructor(file: Source, options: any) {
    this.file = file;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(JavaScript);
  }
  parse = () => {
    // let tree = this.parser.parse(this.file.text);
    // // Get the first comment
    // let first_comment = tree.rootNode.children
    //   .filter(node => node.type === "comment")[0];
    // const first_comment_string = this.file.text
    // .substring(first_comment.startIndex, first_comment.endIndex);
    
    // // Remove any legal or unncessary comments
    // if (first_comment_string.includes("copyright") ||
    //   first_comment_string.includes("author") ||
    //   first_comment_string.includes("terms and conditions")) {
    //   tree.edit({
    //     startIndex: first_comment.startIndex,
    //     oldEndIndex: first_comment.endIndex,
    //     newEndIndex: first_comment.endIndex,
    //     startPosition: { row: 0, column: 0 },
    //     oldEndPosition: { row: 0, column: 0 },
    //     newEndPosition: { row: 0, column: 0 },
    //   });
    //   tree = this.parser.parse('', tree);
    // }
    // return {
    //   file: this.file,
    //   comments: CommentParser.parse(tree.rootNode, this.file.text)
    //     .filter(this.filterType)
    //     // .map(this.checkType)
    //     .map(this.parseChildren)
    // }
  }

  // private filterType = (comment): boolean => {
  //   return (this.options.filter ||
  //     [
  //       'function',
  //       'class',
  //       'variable_declaration'
  //     ]).includes(comment.context.type)
  // }

  // private checkType = (comment) => {
  //   const tree = this.parser.parse(comment.context.text);
  //   switch (comment.context.type) {
  //     case 'variable_declaration':
  //       // Check whether we have an anonymous class
  //       if (comment.context.text.includes("class")) {
  //         // Drill down until we find the class body
  //         const variable_declarator = tree.rootNode.children[0].children[1];
  //         const anonymous_class = variable_declarator.children
  //           .filter(node => node.type === "anonymous_class")[0]
  //         const class_body = anonymous_class.children[1];
  //         comment.context.children = CommentParser.parse(
  //           class_body,
  //           comment.context.text,
  //           { location: comment.context.location, position: comment.context.position }
  //         );
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  //   return comment;
  // }

  // private parseChildren = (comment) => {
  //   switch (comment.context.type) {
  //     case 'class':
  //       const tree = this.parser.parse(comment.context.text);
  //       comment.context.children = CommentParser.parse(
  //         tree.rootNode,
  //         comment.context.text,
  //         { location: comment.context.location, position: comment.context.position }
  //       ).filter(child => child.context.type === 'method_definition');
  //       break;
  //     default:
  //       break;
  //   }
  //   return comment;
  // }
}