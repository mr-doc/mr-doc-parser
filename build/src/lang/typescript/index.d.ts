import IParser from '../../interfaces/IParser';
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
export default class TypeScriptParser implements IParser {
    private source;
    private options;
    private parser;
    constructor(file: Source, options: any);
    parse: () => import("../common/ast").ASTNode[];
}
