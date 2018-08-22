import { SyntaxNode } from "tree-sitter";
import Source from "../../interfaces/Source";
import { ASTNode } from "../common/ast";
export interface TreeSitterNode {
    visit(visitor: NodeVisitor): void;
}
export interface NodeVisitor {
    getAST(): ASTNode[];
    visitNode(node: SyntaxNode): ASTNode;
    visitChildren(nodes: SyntaxNode[]): ASTNode[];
}
export declare class Node implements TreeSitterNode {
    syntaxNode: SyntaxNode;
    constructor(syntaxNode: SyntaxNode);
    visit: (visitor: NodeVisitor) => void;
}
export declare class TypeScriptVisitor implements NodeVisitor {
    private ast;
    private source;
    private parent;
    constructor(source: Source);
    /**
     * Determines whether a node has inheritance
     */
    private hasInheritance;
    /**
     * Returns a node's inheritance type
     */
    private getInheritanceType;
    private filterComments;
    getAST(): ASTNode[];
    visitNode: (node: SyntaxNode) => ASTNode;
    visitChildren: (nodes: SyntaxNode[]) => ASTNode[];
    private visitProgram;
    private visitComment;
    /**
     * Visit the contextual node
     *
     * # Remark
     *
     * A node is considered contextual when a comment is visited and the node is its sibling.
     */
    private visitContext;
    private visitInterfaceDeclaration;
    private visitInterface;
    private visitSignature;
    private visitTypeNode;
    private visitConstraint;
    private visitInheritanceClause;
    private visitFormalParamters;
    private visitRequiredParameter;
    private visitTerminal;
}
