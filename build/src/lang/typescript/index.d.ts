import * as Parser from 'tree-sitter';
import ParserInterface from '../../interfaces/ParserInterface';
import Source from '../../interfaces/Source';
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
export default class TypeScriptParser implements ParserInterface {
    private source;
    private options;
    private parser;
    private tree_;
    constructor(source: Source, options: any);
    parse: () => import("../common/ast").ASTNode[];
    readonly tree: Parser.Tree;
}
