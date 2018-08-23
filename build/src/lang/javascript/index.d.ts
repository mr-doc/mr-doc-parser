import * as Parser from 'tree-sitter';
import ParserInterface from '../../interfaces/ParserInterface';
import Source from '../../interfaces/Source';
import { ASTNode } from '../common/ast';
/**
 * A class that parses JavaScript comments.
 *
 * # API
 *
 * ```
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 * ```
 */
export default class JavaScriptParser implements ParserInterface {
    private source;
    private options;
    private parser;
    private tree_;
    constructor(source: Source, options: any);
    parse(): ASTNode[];
    readonly tree: Parser.Tree;
}
