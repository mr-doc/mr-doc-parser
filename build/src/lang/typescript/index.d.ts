import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
import IResult from '../../interfaces/IResult';
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
export default class TypeScriptParser implements IParser {
    private file;
    private options;
    private parser;
    constructor(file: IFile, options: any);
    parse: () => IResult;
    private filterType;
    private parseChildren;
}
