import IFile from "./IFile";
import IResult from "./IResult";
export default abstract class IParser {
    constructor(file: IFile, options: any);
    abstract parse(): IResult;
}
