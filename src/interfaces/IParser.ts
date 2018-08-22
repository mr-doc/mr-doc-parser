import Source from "./Source";
import { ASTNode } from "../lang/common/ast";
// import IResult from "./IResult";

export default abstract class IParser {
  constructor(file: Source, options: any) {

  }
  abstract parse(): ASTNode[]
}