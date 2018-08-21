import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitTypeOrTypeIdentifier(source: Source, node: SyntaxNode): any;
export declare function visitType(source: Source, node: SyntaxNode): any;
export declare function visitTypeIdentifier(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
};
export declare function visitUnionType(source: Source, node: SyntaxNode): any;
export declare function visitIntersectionType(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    left: any;
    right: any;
};
export declare function visitParenthesizedType(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    parenthesized: any;
};
export declare function visitGenericType(source: Source, node: SyntaxNode): any;
export declare function visitPredefinedType(source: Source, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
};
