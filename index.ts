import IFile from './src/interfaces/IFile';
import IResult from './src/interfaces/IResult';
import ParserFactory from './src/ParserFactory';
import IParser from './src/interfaces/IParser';
import * as FS from 'fs';

/**
 * A class that parses a source code and generates
 * 
 * # API
 * 
 * ```
 * @class Parser
 * @implements IParser
 * ```
 */
export default class Parser implements IParser {

  private parser: IParser;
  constructor(file: IFile, options: any = {}) {
    this.parser = (new ParserFactory(file, options)).getParser();
  }
  parse = (): IResult => {
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


console.log(JSON.stringify(result, null, 2))