import { Log, LogOptions } from 'mr-doc-utils';
import Source from '../interfaces/Source';
import { SyntaxNode } from 'tree-sitter';
export declare enum ErrorType {
    NodeTypeNotYetSupported = 0,
    TreeSitterParseError = 1
}
export default class ParserLogger extends Log {
    constructor(namespace?: string, options?: LogOptions);
    report: (source: Source, node: SyntaxNode, error: ErrorType) => void;
}
