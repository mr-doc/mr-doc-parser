import Source from "./interfaces/Source";
import ParserInterface from "./interfaces/ParserInterface";
export default class ParserFactory {
    private file;
    private options;
    constructor(file: Source, options?: any);
    getParser: () => ParserInterface;
}
