import { Log } from 'mr-doc-utils';
import Source from '../interfaces/Source';
import { SyntaxNode } from 'tree-sitter';
export declare enum ErrorType {
    NodeTypeNotYetSupported = 0,
    TreeSitterParseError = 1
}
declare class ParserLog extends Log {
    report: (source: Source, node: SyntaxNode, error: ErrorType) => void;
}
declare const log: ParserLog;
export default log;
