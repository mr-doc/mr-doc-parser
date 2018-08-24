import Source from './src/interfaces/Source';
import ParserFactory from './src/ParserFactory';
import Parser from './src/lang/common/parser';
import * as FS from 'fs';
import { Tree } from 'tree-sitter';
// import { ASTNode } from './src/lang/common/ast';
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
export default class MainParser extends Parser {

  private parser: Parser;
  constructor(source: Source, options: any) {
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

const path = `${process.cwd()}/corpus/ReactElementValidator.txt`;
const result = new MainParser({
  name: 'index.ts',
  path: path,
  text: FS.readFileSync(path, 'utf-8')
}, {
  language: 'ts'
}).parse();

// console.log(result);
