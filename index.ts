import Source from './src/interfaces/Source';
import ParserFactory from './src/ParserFactory';
import IParser from './src/interfaces/IParser';
import * as FS from 'fs';
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
export default class Parser implements IParser {

  private parser: IParser;
  constructor(file: Source, options: any = {}) {
    this.parser = (new ParserFactory(file, options)).getParser();
  }
  parse = () => {
    return this.parser.parse()
  }
}
const path = `${process.cwd()}/example.ts`;
const result = new Parser({
  name: 'index.ts',
  path: path,
  text: FS.readFileSync(path, 'utf-8')
}, {
  language: 'typescript'
}).parse();