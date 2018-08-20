import Source from "./Source";
// import IResult from "./IResult";

export default abstract class IParser {
  constructor(file: Source, options: any) {

  }
  abstract parse(): any
}