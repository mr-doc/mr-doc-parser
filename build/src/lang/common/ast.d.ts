import { SyntaxNode } from "tree-sitter";
import Source from "../../interfaces/Source";
import ASTNode from "../../interfaces/ASTNode";
export declare function isASTNode(object: object): object is ASTNode;
export declare function createASTNode(source: Source, node: SyntaxNode): ASTNode;
export declare function createASTNode(source: Source, node: SyntaxNode, properties: object): any;
export declare function createASTNode(source: Source, node: SyntaxNode, children: object[]): ASTNode;
export declare function createASTNode(source: Source, node: SyntaxNode, children: object[], properties: object): any;
export declare function createASTNode(source: Source, node: SyntaxNode, context: ASTNode, document: boolean): ASTNode;
