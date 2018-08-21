import { NodeProperties } from "../Node";
import { SyntaxNode } from "tree-sitter";
import Source from "../../../interfaces/Source";
export declare function visitNode(source: Source, node: SyntaxNode, comment: SyntaxNode, properties: Partial<NodeProperties>): any;
