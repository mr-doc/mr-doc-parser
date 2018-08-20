import Source from "./interfaces/Source";
import IParser from "./interfaces/IParser";
import JavaScriptParser from "./lang/javascript";
import TypeScriptParser from './lang/typescript';

export default class ParserFactory {
  private file: Source
  private options = {
    language: 'JavaScript'
  }
  constructor(file: Source, options: any = {}) {
    this.file = file;
    Object.assign(this.options, options)
  }

  getParser = (): IParser => {
    switch (this.options.language.toLowerCase()) {
      case 'js':
      case 'javascript':
        return new JavaScriptParser(this.file, this.options);
      case 'ts':
      case 'typescript':
        return new TypeScriptParser(this.file, this.options);
      default:
      console.log(`[mr-doc]: No parser for ${this.options.language} exists.`)
        break;
    }
  }

}