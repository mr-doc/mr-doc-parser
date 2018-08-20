import IFile from "./IFile";
export default abstract class IParser {
    constructor(file: IFile, options: any);
    abstract parse(): any;
}
