import IFile from './src/interfaces/IFile';
import ParserFactory from './src/ParserFactory';
import IParser from './src/interfaces/IParser';
import * as FS from 'fs';

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
  constructor(file: IFile, options: any = {}) {
    this.parser = (new ParserFactory(file, options)).getParser();
  }
  parse = () => {
    return this.parser.parse()
  }
}

const result = new Parser({
  name: 'index.ts',
  path: '../../',
  text: FS.readFileSync(`${process.cwd()}/example.ts`, 'utf-8')
}, {
  language: 'typescript'
}).parse();


// console.log(JSON.stringify(result, null, 2))
console.log(result);
