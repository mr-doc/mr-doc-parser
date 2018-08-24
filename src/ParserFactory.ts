import Source from "./interfaces/Source";
import JavaScriptParser from "./lang/javascript";
import TypeScriptParser from './lang/typescript';
import Parser from "./lang/common/parser";

export default class ParserFactory {
  private source: Source
  private options = {
    language: 'JavaScript'
  }
  constructor(file: Source, options: any = {}) {
    this.source = file;
    Object.assign(this.options, options)
  }

  getParser = (): Parser => {
    switch (this.options.language.toLowerCase()) {
      case 'js':
      case 'javascript':
        return new JavaScriptParser(this.source, this.options);
      case 'ts':
      case 'typescript':
        return new TypeScriptParser(this.source, this.options);
      default:
      console.log(`[mr-doc]: No parser for ${this.options.language} exists.`)
        break;
    }
  }
}