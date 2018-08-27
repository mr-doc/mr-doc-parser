import Source from "../../interfaces/Source";
import { Tree } from "tree-sitter";
import ASTNode from "../../interfaces/ASTNode";
import { LogOptions } from "mr-doc-utils";
import { XDocParserOptions } from "xdoc-parser/src/XDocParser";

export interface ParserOptions {
  log: LogOptions,
  documentation: XDocParserOptions,
  language?: string
}

export default abstract class Parser {
  private source_: Source
  protected options: ParserOptions
  constructor(source: Source, options: Partial<ParserOptions>) {
    this.source_ = source;
    this.options = Object.assign((options || {}), {
      log: {
        enabled: true,
        levels: ['info', 'warn', 'error']
      } as LogOptions,
      documentation: {
      } as XDocParserOptions,
    });
  }
  get source(): Source { return this.source_; }
  get language(): string { return this.options.language; }
  abstract parse(): ASTNode[]
  abstract get tree(): Tree
}