import Source from "./Source";
import { ASTNode } from "../lang/common/ast";
import { Tree } from "tree-sitter";
export default abstract class Parser {
    protected source: Source;
    protected options: any;
    constructor(source: Source, options: any);
    abstract parse(): ASTNode[];
    abstract readonly tree: Tree;
}
