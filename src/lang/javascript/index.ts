import * as TreeSitter from 'tree-sitter';
import * as JavaScript from 'tree-sitter-javascript';
import Parser from '../common/parser';
import Source from '../../interfaces/Source';
import { JavaScriptVisitor } from './visitor';
import walk from '../../utils/walk';
import ASTNode from '../../interfaces/ASTNode';

/**
 * A class that parses JavaScript comments.
 * 
 * # API
 * 
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 */
export default class JavaScriptParser extends Parser {
  private parser: TreeSitter;
  private tree_: TreeSitter.Tree;
  constructor(source: Source, options: any) {
    super(source, options);
    this.parser = new TreeSitter();
    this.parser.setLanguage(JavaScript);
    this.tree_ = this.parser.parse(this.source.text);
  }
  parse(): ASTNode[] {
    const visitor = new JavaScriptVisitor(this.source);
    const nodes = walk(this.tree_.rootNode);
    nodes.visit(visitor)
    return visitor.getAST();
  }
  get tree (): TreeSitter.Tree {
    return this.tree_;
  }
}