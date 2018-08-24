import { SyntaxNode } from "tree-sitter";
import Visitor from "./visitor";
export interface TreeSitterNode {
    visit(visitor: Visitor): void;
}
/**
 * A class that wraps a SyntaxNode as a Node
 */
export declare class Node implements TreeSitterNode {
    syntaxNode: SyntaxNode;
    constructor(syntaxNode: SyntaxNode);
    visit: (visitor: Visitor) => void;
}
