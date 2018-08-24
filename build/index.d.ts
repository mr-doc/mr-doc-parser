import Source from './src/interfaces/Source';
import Parser from './src/lang/common/parser';
import { Tree } from 'tree-sitter';
/**
 * A class that parses a source code and generates an AST.
 *
 * @class Parser
 * @implements IParser
 *
 * # Example
 *
 * ```js
 * const parser = new Parser({
 *  name: '...',
 *  path: '....',
 *  text: '...'
 * }, { language: 'typescript' });
 *
 * const result = parser.parse();
 *
 * ```
 */
export default class MainParser extends Parser {
    private parser;
    constructor(source: Source, options: any);
    parse: () => import("./src/interfaces/ASTNode").default[];
    readonly tree: Tree;
}
