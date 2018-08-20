import { SyntaxNode } from "tree-sitter";
import { visitFormalParameters } from "./formal_parameters.visitor";
import { visitType } from "./type.visitor";
import Source from "../../../interfaces/Source";
import match from "../../../utils/match";
import visitTypeParameters from "./type_parameters.visitor";

export function visitCallSignature(source: Source, node: SyntaxNode) {

    let call_signature = node.children,
    type_parameters,
    formal_parameters,
    type_annotation;

    if (match(call_signature[0], 'type_parameters')) {
        type_parameters = visitTypeParameters(source, call_signature.shift());
    }

    if (match(call_signature[0], 'formal_parameters')) {
        formal_parameters = visitFormalParameters(source, call_signature.shift());
    }

    if (match(call_signature[0], 'type_annotation')) {
        let type = call_signature.shift().children[1];
        type_annotation = visitType(source, type);
    }

    return { type_parameters, formal_parameters, type_annotation }

}