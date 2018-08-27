import { SyntaxNode } from "tree-sitter";
import ASTNode from "../../interfaces/ASTNode";
import { LogOptions, LogInterface } from "mr-doc-utils";
import { XDocParserOptions } from "xdoc-parser/src/XDocParser";
import ParserLogger from "../../utils/log";

export interface VisitorOptions {
  log: LogOptions,
  documentation: XDocParserOptions
}

export default abstract class Visitor {
  protected options: Partial<VisitorOptions>
  protected logger: ParserLogger
  constructor(options?: Partial<VisitorOptions>) {
    this.options = options;
    this.logger = new ParserLogger(this.options.log);
  }
  abstract getAST(): ASTNode[]
  abstract visitNode(node: SyntaxNode, properties?: object): ASTNode
  abstract visitChildren(nodes: SyntaxNode[], properties?: object): ASTNode[]
}