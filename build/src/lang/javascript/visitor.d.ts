import { SyntaxNode } from "tree-sitter";
import Source from "../../interfaces/Source";
import Visitor, { VisitorOptions } from "../common/visitor";
import ASTNode from "../../interfaces/ASTNode";
import { JavaScriptProperties } from "./properties";
/**
 * A class that visits ASTNodes from a TypeScript tree.
 */
export declare class JavaScriptVisitor extends Visitor {
    private ast;
    private source;
    constructor(source: Source, options: Partial<VisitorOptions>);
    /**
     * Determines whether a node has inheritance
     */
    private hasInheritance;
    /**
     * Returns a node's inheritance type
     */
    private getInheritanceType;
    /**
     * Determines whether an export is default
     */
    private hasDefaultExport;
    /**
     * Returns only the comments from a node's children.
     */
    private filterType;
    getAST(): ASTNode[];
    visitNode: (node: SyntaxNode, properties?: Partial<JavaScriptProperties>) => ASTNode;
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
    private visitExportStatement;
    private visitExpressionStatement;
    private visitInternalModule;
    private visitClass;
    private visitNonTerminal;
    private visitTerminal;
}
