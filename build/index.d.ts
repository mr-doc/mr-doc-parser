import IFile from './src/interfaces/IFile';
import IResult from './src/interfaces/IResult';
import IParser from './src/interfaces/IParser';
/**
 * A class that parses a source code and generates
 *
 * # API
 *
 * ```
 * @class Parser
 * @implements IParser
 * ```
 */
export default class Parser implements IParser {
    private parser;
    constructor(file: IFile, options?: any);
    parse: () => IResult;
}
