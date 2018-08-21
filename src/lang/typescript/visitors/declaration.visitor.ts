import { SyntaxNode } from "tree-sitter";
import { NodeProperties, createNode } from "../node";
import Source from "../../../interfaces/Source";
import log, { ErrorType } from "../../../utils/log";
import match from "../../../utils/match";
import visitTypeParameters, { visitTypeIdentifier, visitObjectType } from "./type.visitor";



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
            log.report(source, node, ErrorType.NodeTypeNotYetSupported);
            break;
    }
}

export function visitInterfaceDeclaration(
    source: Source,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    let children = node.children,
    type_identifier,
    type_parameters,
    body;

    if (match(children[0], 'interface')) {
        children.shift();
    }

    if (match(children[0], 'type_identifier')) {
        type_identifier = visitTypeIdentifier(source, children.shift());
    }

    if (match(children[0], 'type_parameters')) {
        type_parameters = visitTypeParameters(source, children.shift());
    }

    if (match(children[0], 'object_type')) {
        body = visitObjectType(source, children.shift());
    }
    
}

export function visitLexicalDeclaration(
    source: Source,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    let children = node.children
        .filter(child => !child.type.match(/[;]/)),
        scope,
        variable_declarator;

    if (match(children[0], 'const', 'let')) {
        scope = createNode(source, children.shift());
    }

    if (match(children[0], 'variable_declarator')) {
        variable_declarator = visitVariableDeclarator(source, children.shift());
    }

    return {
        type: node.type,
        context: createNode(source, node, properties),
        comment: createNode(source, comment, null, true),
        scope,
        variable_declarator
    }
}


export function visitVariableDeclarator(source: Source, node: SyntaxNode) {
    let children = node.children
        .filter(child => !child.type.match(/[=;]/)),
        identifier,
        type_annotation,
        initializer;

    if (match(children[0], 'identifier')) {
        identifier = createNode(source, children.shift());
    }

    if (match(children[0], 'type_annotation')) {
        type_annotation = createNode(source, children.shift());
    }

    if (children[0]) {
        initializer = createNode(source, children.shift());
    }

    return {
        type: node.type,
        context: createNode(source, node),
        identifier,
        type_annotation,
        initializer
    }
}