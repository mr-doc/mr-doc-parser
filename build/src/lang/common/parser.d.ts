import Source from "../../interfaces/Source";
import { Tree } from "tree-sitter";
import ASTNode from "../../interfaces/ASTNode";
import { LogOptions } from "mr-doc-utils";
import { XDocParserOptions } from "xdoc-parser/src/XDocParser";
export interface ParserOptions {
    log: LogOptions;
    documentation: XDocParserOptions;
    language?: string;
}
export default abstract class Parser {
    private source_;
    protected options: ParserOptions;
    constructor(source: Source, options: Partial<ParserOptions>);
    readonly source: Source;
    readonly language: string;
    abstract parse(): ASTNode[];
    abstract readonly tree: Tree;
}
