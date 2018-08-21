import Source from "./Source";
export default abstract class IParser {
    constructor(file: Source, options: any);
    abstract parse(): any;
}
