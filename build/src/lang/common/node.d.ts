import { ASTNode } from "./ast";
import { SyntaxNode } from "tree-sitter";
export interface TreeSitterNode {
    visit(visitor: NodeVisitor): void;
}
export interface NodeVisitor {
    getAST(): ASTNode[];
    visitNode(node: SyntaxNode, properties?: object): ASTNode;
    visitChildren(nodes: SyntaxNode[], properties?: object): ASTNode[];
}
export declare class Node implements TreeSitterNode {
    syntaxNode: SyntaxNode;
    constructor(syntaxNode: SyntaxNode);
    visit: (visitor: NodeVisitor) => void;
}
