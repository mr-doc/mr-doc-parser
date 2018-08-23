import Source from './src/interfaces/Source';
import ParserInterface from './src/interfaces/ParserInterface';
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
export default class Parser implements ParserInterface {
    private parser;
    constructor(file: Source, options?: any);
    parse: () => import("./src/lang/common/ast").ASTNode[];
    readonly tree: Tree;
}
