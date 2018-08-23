import * as Parser from 'tree-sitter';
import * as JavaScript from 'tree-sitter-javascript';
import ParserInterface from '../../interfaces/ParserInterface';
import Source from '../../interfaces/Source';
import { ASTNode } from '../common/ast';
import { JavaScriptVisitor } from './visitor';
import walk from '../../utils/walk';

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
export default class JavaScriptParser implements ParserInterface {
  
  private source: Source;
  private options: any;
  private parser: Parser;
  private tree_: Parser.Tree;
  constructor(source: Source, options: any) {
    this.source = source;
    Object.assign(this.options = {}, options || {});
    this.parser = new Parser();
    this.parser.setLanguage(JavaScript);
    this.tree_ = this.parser.parse(this.source.text);
  }
  parse(): ASTNode[] {
    const visitor = new JavaScriptVisitor(this.source);
    const root = walk(this.tree.rootNode);
    // console.time('visit')
    root.visit(visitor)
    // console.timeEnd('visit')
    return visitor.getAST();
  }
  get tree (): Parser.Tree {
    return this.tree_;
  }
}