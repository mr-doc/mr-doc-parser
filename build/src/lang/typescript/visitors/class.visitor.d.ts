import { NodeProperties } from "../Node";
import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitClass(source: Source, node: SyntaxNode, comment: SyntaxNode, properties?: Partial<NodeProperties>): {
    type: string;
    identifier: import("../Node").Node;
    type_parameters: {
        type: string;
        context: import("../Node").Node;
        parameters: {
            type: string;
            context: import("../Node").Node;
        }[];
    } | {
        type: string;
        heritage_type: string;
        context: import("../Node").Node;
        heritages: {
            type: string;
            context: import("../Node").Node;
        }[];
    } | {
        type: string;
        context: import("../Node").Node;
        methods: any[];
        properties: any[];
    };
    heritage: {
        type: string;
        context: import("../Node").Node;
        parameters: {
            type: string;
            context: import("../Node").Node;
        }[];
    } | {
        type: string;
        heritage_type: string;
        context: import("../Node").Node;
        heritages: {
            type: string;
            context: import("../Node").Node;
        }[];
    } | {
        type: string;
        context: import("../Node").Node;
        methods: any[];
        properties: any[];
    };
    body: {
        type: string;
        context: import("../Node").Node;
        parameters: {
            type: string;
            context: import("../Node").Node;
        }[];
    } | {
        type: string;
        heritage_type: string;
        context: import("../Node").Node;
        heritages: {
            type: string;
            context: import("../Node").Node;
        }[];
    } | {
        type: string;
        context: import("../Node").Node;
        methods: any[];
        properties: any[];
    };
    properties: Partial<NodeProperties>;
    comment: import("../Node").Node;
    context: import("../Node").Node;
};
export declare function visitClassHeritage(source: Source, node: SyntaxNode): {
    type: string;
    heritage_type: string;
    context: import("../Node").Node;
    heritages: {
        type: string;
        context: import("../Node").Node;
    }[];
};
export declare function visitClassBody(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    methods: any[];
    properties: any[];
};
