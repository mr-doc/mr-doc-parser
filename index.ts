import Source from './src/interfaces/Source';
import ParserFactory from './src/ParserFactory';
import ParserInterface from './src/interfaces/ParserInterface';
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
export default class Parser implements ParserInterface {

  private parser: ParserInterface;
  constructor(file: Source, options: any = {}) {
    this.parser = (new ParserFactory(file, options)).getParser();
  }
  parse = () => {
    return this.parser.parse()
  }
  get tree (): Tree {
    return this.parser.tree;
  }
}

const path = `${process.cwd()}/corpus/ReactElementValidator.txt`;
const result = new Parser({
  name: 'index.ts',
  path: path,
  text: FS.readFileSync(path, 'utf-8')
}, {
  language: 'ts'
}).parse();

// console.log(result);
