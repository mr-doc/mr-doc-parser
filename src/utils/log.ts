import { Log, LogOptions } from 'mr-doc-utils';
import Source from '../interfaces/Source';
import { SyntaxNode } from 'tree-sitter';
import range from './range';

export enum ErrorType {
    NodeTypeNotYetSupported,
    TreeSitterParseError
}

export default class ParserLogger extends Log {
    constructor(options?: LogOptions) {
        super('mr-doc::parser', options);
    }
    report = (source: Source, node: SyntaxNode, error: ErrorType): void => {
        const location = range(node).location;
        const sameLine = location.row.start === location.row.end;
        const getLineRange = () => sameLine ? location.row.start + 1 : location.row.start + 1 + ' - ' + location.row.end + 1;
        const culprit = `Line${sameLine ? '' : 's'} ${getLineRange()} in '${source.path}'`;
        switch (error) {
            case ErrorType.NodeTypeNotYetSupported:
                this.info(`'${node.type.replace(/[_]/g, ' ')}' is not yet supported:\n${culprit}`)
                break;
            case ErrorType.TreeSitterParseError:
                this.error(`'tree-sitter' was not able to parse the program:\n${culprit}`)
            default:
                break;
        }
    }
}