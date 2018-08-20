import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import IFile from "../../../interfaces/IFile";
import log, { ErrorType } from "../../../utils/log";



export function visitDeclaration(
    source: IFile,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    switch (node.type) {
        case 'interface_declaration':
            return visitInterfaceDeclaration(source, node, comment, properties);
        case 'lexical_declaration':
            return visitLexicalDeclaration(source, node, comment, properties);
        default:
            log.report(source, node, ErrorType.NodeTypeNotSupported);
            break;
    }
}

export function visitInterfaceDeclaration(
    source: IFile,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    console.log(node.children);

}

export function visitLexicalDeclaration(
    source: IFile,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    console.log(node.children);

}