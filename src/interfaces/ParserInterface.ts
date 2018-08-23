import Source from "./Source";
import { ASTNode } from "../lang/common/ast";
import { Tree } from "tree-sitter";
// import IResult from "./IResult";

export default abstract class ParserInterface {
  constructor(source: Source, options: any) {

  }
  abstract parse(): ASTNode[]
  abstract get tree(): Tree
}