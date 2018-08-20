import IFile from './src/interfaces/IFile';
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
    constructor(file: IFile, options?: any);
    parse: () => any;
}
