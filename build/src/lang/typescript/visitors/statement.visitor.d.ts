import { NodeProperties } from "../Node";
import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitStatement(source: Source, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): any;
export declare function visitExpressionStatement(source: Source, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): any;
export declare function visitExportStatement(source: Source, node: SyntaxNode, comment: SyntaxNode): any;
