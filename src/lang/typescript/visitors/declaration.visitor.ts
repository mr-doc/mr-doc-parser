import { SyntaxNode } from "tree-sitter";
import { NodeProperties } from "../Node";
import Source from "../../../interfaces/Source";
import log, { ErrorType } from "../../../utils/log";



export function visitDeclaration(
    source: Source,
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
    source: Source,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    console.log(node.children);

}

export function visitLexicalDeclaration(
    source: Source,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    console.log(node.children);

}