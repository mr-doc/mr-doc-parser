import { Log } from 'mr-doc-utils';
import IFile from '../interfaces/IFile';
import { SyntaxNode } from 'tree-sitter';
export declare enum ErrorType {
    NodeTypeNotSupported = 0,
    TreeSitterParseError = 1
}
export declare class ParserLog extends Log {
    report: (source: IFile, node: SyntaxNode, error: ErrorType) => void;
}
declare const log: ParserLog;
export default log;
