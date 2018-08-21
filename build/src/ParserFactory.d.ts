import Source from "./interfaces/Source";
import IParser from "./interfaces/IParser";
export default class ParserFactory {
    private file;
    private options;
    constructor(file: Source, options?: any);
    getParser: () => IParser;
}
