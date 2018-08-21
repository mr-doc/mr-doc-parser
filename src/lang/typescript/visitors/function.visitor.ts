import { NodeProperties, createNode } from "../node";
import { SyntaxNode } from "tree-sitter";
import { visitCallSignature } from "./signature.visitor";
import match from "../../../utils/match";
import Source from "../../../interfaces/Source";

export function visitFunction(
    source: Source,
    node: SyntaxNode,
    comment: SyntaxNode,
    properties: Partial<NodeProperties>
) {
    let children = node.children;
    let isAync = false,
        identifier,
        type_parameters,
        formal_parameters,
        type_annotation;

    if (match(children[0], 'async')) {
        isAync = true;
        children.shift();
    }

    if (match(children[0], 'function')) {
        children.shift();
    }

    if (match(children[0], 'identifier')) {
        identifier = createNode(source, children.shift())
    }

    if (match(children[0], 'call_signature')) {
        let call_signature = visitCallSignature(source, children.shift())
        type_parameters = call_signature.type_parameters;
        formal_parameters = call_signature.formal_parameters;
        type_annotation = call_signature.type_annotation;
    }

    return {
        type: 'function',
        context: createNode(source, node, properties),
        comment: createNode(source, comment, null, true),
        isAync,
        identifier,
        type_parameters,
        formal_parameters,
        type_annotation,
        properties
    }

}