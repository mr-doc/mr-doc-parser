import Source from './src/interfaces/Source';
import ParserFactory from './src/ParserFactory';
import Parser from './src/lang/common/parser';
import { Tree } from 'tree-sitter';

/**
 * A class that parses a source code and generates an AST.
 * 
 * @class Parser
 * @implements IParser
 * 
 * # Example
 * 
 * ```js
 * const parser = new Parser({
 *  name: '...',
 *  path: '....',
 *  text: '...'
 * }, { language: 'typescript' });
 * 
 * const result = parser.parse();
 * 
 * ```
 */
export default class DocParser extends Parser {

  private parser: Parser;
  constructor(source: Source, options?: object) {
    super(source, options)
    this.parser = (new ParserFactory(this.source, this.options)).getParser();
  }
  parse = () => {
    return this.parser.parse()
  }
  get tree (): Tree {
    return this.parser.tree;
  }
}
