'use strict';
import JavaScript from './parser/javascript/index';
import IParser, { IParseResult, IFile } from './parser/interface';

export default class Parser {
  options: {
    language: string,
  }
  constructor(options: any) {
    this.options = options;
  }
  /*
    @param file: IFile
   */
  parse(file: IFile): IParseResult {
    switch (this.options.language) {
      case 'js':
      case 'javascript':
        return (new JavaScript().parse(file));
      default:
        return { type: '', file: { name: '', source: '' }, comments: [] };
    }
  }
}
