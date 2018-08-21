import { DocumentationNode } from 'xdoc-parser/src/XDocASTNode';
import { RemarkNode } from 'xdoc-parser/src/XDocParser';
import { SyntaxNode } from "tree-sitter";
import Source from "../../interfaces/Source";
import TextRange from "../../interfaces/TextRange";
export interface ASTNode extends TextRange {
    text: string;
    properties?: any;
    comment?: {
        markdown: RemarkNode;
        documentation: Partial<DocumentationNode>;
    };
}
export declare function createASTNode(source: Source, node: SyntaxNode, document?: boolean): ASTNode;
export interface NodeProperties {
    exports: Partial<NodeExports>;
    inheritance: Partial<NodeInheritance>;
}
export interface NodeExports {
    export: boolean;
    default: boolean;
}
export interface NodeInheritance {
    extends: boolean;
    implements: boolean;
}
