import IComment from "./interfaces/IComment";
import * as Parser from 'tree-sitter';
import { Location, Position } from './interfaces/IComment';
export default class CommentParser {
    static parse(node: Parser.SyntaxNode, source: string, offset?: {
        location: Location;
        position: Position;
    }, comments?: IComment[]): IComment[];
}
