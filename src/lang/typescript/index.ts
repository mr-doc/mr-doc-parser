import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import IParser from '../../interfaces/IParser';
import Source from '../../interfaces/Source';
import walk from '../../utils/walk';
import { TypeScriptVisitor } from './visitor';


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
  private source: Source;
  private options: any;
  private parser: Parser;
  constructor(file: Source, options: any) {
    this.source = file;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
  }
  parse = () => {
    const tree = this.parser.parse(this.source.text);
    if (tree.rootNode.type === "program") {
      const visitor = new TypeScriptVisitor(this.source);
      walk(tree.rootNode).visit(visitor);
      return visitor.getAST();
    }
  }
}
