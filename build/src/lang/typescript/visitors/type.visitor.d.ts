import { SyntaxNode } from "tree-sitter";
import IFile from "../../../interfaces/IFile";
export declare function visitTypeOrTypeIdentifier(source: IFile, node: SyntaxNode): any;
export declare function visitType(source: IFile, node: SyntaxNode): any;
export declare function visitTypeIdentifier(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
};
export declare function visitUnionType(source: IFile, node: SyntaxNode): any;
export declare function visitIntersectionType(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    left: any;
    right: any;
};
export declare function visitParenthesizedType(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
    parenthesized: any;
};
export declare function visitGenericType(source: IFile, node: SyntaxNode): any;
export declare function visitPredefinedType(source: IFile, node: SyntaxNode): {
    type: string;
    context: import("../Node").Node;
};
