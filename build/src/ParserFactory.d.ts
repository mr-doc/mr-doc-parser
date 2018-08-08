import IFile from "./interfaces/IFile";
import IParser from "./interfaces/IParser";
export default class ParserFactory {
    private file;
    private options;
    constructor(file: IFile, options?: any);
    getParser: () => IParser;
}
