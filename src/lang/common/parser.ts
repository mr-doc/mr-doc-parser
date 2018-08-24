import Source from "../../interfaces/Source";
import { Tree } from "tree-sitter";
import ASTNode from "../../interfaces/ASTNode";

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