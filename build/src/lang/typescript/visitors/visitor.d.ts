import { NodeProperties } from "../Node";
import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export interface TreeSitterNode {
    visit(visitor: NodeVisitor): void;
}
export interface NodeVisitor {
    getAST(): object[];
    visitNode(node: SyntaxNode): any;
    visitChildren(nodes: SyntaxNode[]): any;
}
export declare class Node implements TreeSitterNode {
    syntaxNode: SyntaxNode;
    constructor(syntaxNode: SyntaxNode);
    visit: (visitor: NodeVisitor) => NodeVisitor;
}
export declare class TypeScriptVisitor implements NodeVisitor {
    private ast;
    private source;
    private parent;
    constructor(source: Source);
    private hasInheritance;
    private getInheritanceType;
    getAST(): object[];
    visitNode: (node: SyntaxNode) => {
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitChildren: (nodes: SyntaxNode[]) => {}[];
    visitProgram: (node: SyntaxNode) => {}[];
    visitComment: (node: SyntaxNode) => {
        context: {
            children: {}[];
            properties: Partial<NodeProperties>;
            text: string;
            comment?: {
                markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
                documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
            };
            position: import("../../../interfaces/TextRange").Range;
            location: {
                row: import("../../../interfaces/TextRange").Range;
                column: import("../../../interfaces/TextRange").Range;
            };
            type: string;
        };
        comment: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        text: string;
        properties?: any;
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitContext: (node: SyntaxNode, properties?: Partial<NodeProperties>) => {
        children: {}[];
        properties: Partial<NodeProperties>;
        text: string;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitInterfaceDeclaration: (node: SyntaxNode, properties?: Partial<NodeProperties>) => {
        children: {}[];
        properties: Partial<NodeProperties>;
        text: string;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitInterface: (node: SyntaxNode, properties: Partial<NodeProperties>) => {
        children: {}[];
        properties: Partial<NodeProperties>;
        text: string;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitCallSignature: (node: SyntaxNode, properties: Partial<NodeProperties>) => {
        children: {}[];
        properties: Partial<NodeProperties>;
        text: string;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitTypeNode: (node: SyntaxNode) => {
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    } | {
        children: {}[];
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: "type_parameters";
    } | {
        children: {}[];
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: "type_parameter";
    } | {
        children: {}[];
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: "object_type";
    };
    visitConstraint: (node: SyntaxNode) => {
        children: {}[];
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitInheritanceClause: (node: SyntaxNode) => {
        children: {}[];
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
    visitTerminal: (node: SyntaxNode) => {
        text: string;
        properties?: any;
        comment?: {
            markdown: import("xdoc-parser/src/XDocParser").RemarkNode;
            documentation: Partial<import("xdoc-parser/src/XDocASTNode").DocumentationNode>;
        };
        position: import("../../../interfaces/TextRange").Range;
        location: {
            row: import("../../../interfaces/TextRange").Range;
            column: import("../../../interfaces/TextRange").Range;
        };
        type: string;
    };
}
