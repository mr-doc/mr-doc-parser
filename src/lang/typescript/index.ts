import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import Source from '../../interfaces/Source';
import { visitProgram } from './visitors/program.visitor';
import { walk } from './walk';


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
  private file: Source;
  private options: any;
  private parser: Parser;
  constructor(file: Source, options: any) {
    this.file = file;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }
  parse = () => {
    const tree = this.parser.parse(this.file.text);
    if (tree.rootNode.type === "program") {
      walk(tree.rootNode);
      // return visitProgram(this.file, tree.rootNode)
    }
  }
}
