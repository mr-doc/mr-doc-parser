import * as TreeSitter from 'tree-sitter';
import Parser from '../common/parser';
import Source from '../../interfaces/Source';
import ASTNode from '../../interfaces/ASTNode';
/**
 * A class that parses JavaScript comments.
 *
 * # API
 *
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 */
export default class JavaScriptParser extends Parser {
    private parser;
    private tree_;
    constructor(source: Source, options: any);
    parse(): ASTNode[];
    readonly tree: TreeSitter.Tree;
}
