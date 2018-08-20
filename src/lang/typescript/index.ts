import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import { visitProgram } from './visitors/program.visitor';


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
  parse = () => {
    const tree = this.parser.parse(this.file.text);
    if (tree.rootNode.type === "program") {
      return visitProgram(this.file, tree.rootNode)
    }
  }
}
