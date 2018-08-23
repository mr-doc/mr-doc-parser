import * as Parser from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import ParserInterface from '../../interfaces/ParserInterface';
import Source from '../../interfaces/Source';
import walk from '../../utils/walk';
import { TypeScriptVisitor } from './visitor';
import log from '../../utils/log';


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
export default class TypeScriptParser implements ParserInterface {
  private source: Source;
  private options: any;
  private parser: Parser;
  private tree_: Parser.Tree;
  constructor(source: Source, options: any) {
    this.source = source;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript);
    this.tree_ = this.parser.parse(this.source.text);
  }
  parse = () => {
    const visitor = new TypeScriptVisitor(this.source);
    const root = walk(this.tree.rootNode);
    // console.time('visit')
    root.visit(visitor)
    // console.timeEnd('visit')
    return visitor.getAST();
  }

  get tree (): Parser.Tree {
    return this.tree;
  }
}
