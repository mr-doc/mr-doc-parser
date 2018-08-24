import * as TreeSitter from 'tree-sitter';
import * as TypeScript from 'tree-sitter-typescript';
import Parser from '../common/parser';
import Source from '../../interfaces/Source';
import walk from '../../utils/walk';
import { TypeScriptVisitor } from './visitor';
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
export default class TypeScriptParser extends Parser {
  private parser: TreeSitter;
  private tree_: TreeSitter.Tree;
  constructor(source: Source, options: any) {
    super(source, options);
    this.parser = new TreeSitter();
    this.parser.setLanguage(TypeScript);
    this.tree_ = this.parser.parse(this.source.text);
  }
  parse = (): ASTNode[] => {
    const visitor = new TypeScriptVisitor(this.source);
    const nodes = walk(this.tree_.rootNode);
    nodes.visit(visitor)
    return visitor.getAST();
  }

  get tree (): TreeSitter.Tree {
    return this.tree_;
  }
}
