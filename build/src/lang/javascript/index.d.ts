import IParser from '../../interfaces/IParser';
import IFile from '../../interfaces/IFile';
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
export default class JavaScriptParser implements IParser {
    private file;
    private options;
    private parser;
    constructor(file: IFile, options: any);
    parse: () => void;
}
