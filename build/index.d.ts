import Source from './src/interfaces/Source';
import IParser from './src/interfaces/IParser';
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
export default class Parser implements IParser {
    private parser;
    constructor(file: Source, options?: any);
    parse: () => any;
}
