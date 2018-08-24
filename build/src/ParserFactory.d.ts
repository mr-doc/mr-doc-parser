import Source from "./interfaces/Source";
import Parser from "./lang/common/parser";
export default class ParserFactory {
    private source;
    private options;
    constructor(file: Source, options?: any);
    getParser: () => Parser;
}
