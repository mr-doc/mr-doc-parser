import { Log } from 'mr-doc-utils';
import IFile from '../interfaces/IFile';
import { SyntaxNode } from 'tree-sitter';
import range from './range';

export enum ErrorType {
    NodeTypeNotSupported,
    TreeSitterParseError
}

class ParserLog extends Log {
    report = (source: IFile, node: SyntaxNode, error: ErrorType): void => {
        const location = range(node).location;
        const sameLine = location.row.start === location.row.end;
        const getRange = () => sameLine ? location.row.start + 1 : location.row.start + 1 + ' - ' + location.row.end + 1;
        const culprit = `Line${sameLine ? '' : 's'} ${getRange()} in '${source.path}${source.name}'`;
        switch (error) {
            case ErrorType.NodeTypeNotSupported:
                this.info(`'${node.type.replace(/[_]/g, ' ')}' is not yet supported:\n${culprit}`)
                break;
            case ErrorType.TreeSitterParseError:
                this.error(`'tree-sitter' was not able to parse the program:\n${culprit}`)
            default:
                break;
        }
    }
}


const log = new ParserLog('mr-doc::parser');

export default log;