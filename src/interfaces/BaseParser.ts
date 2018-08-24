import Source from "./Source";
import { ASTNode } from "../lang/common/ast";
import { Tree } from "tree-sitter";
// import IResult from "./IResult";

export default abstract class Parser {
  protected source: Source
  protected options: any
  constructor(source: Source, options: any) {
    this.source = source;
    this.options = options || {};
  }
  abstract parse(): ASTNode[]
  abstract get tree(): Tree
}