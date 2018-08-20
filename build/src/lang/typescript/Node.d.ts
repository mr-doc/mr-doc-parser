import TextRange from "../../interfaces/TextRange";
import { SyntaxNode } from "tree-sitter";
import { DocumentationNode } from 'xdoc-parser/src/XDocASTNode';
import { RemarkNode } from 'xdoc-parser/src/XDocParser';
import IFile from "../../interfaces/IFile";
export interface Node extends TextRange {
    text: string;
    properties?: Partial<NodeProperties>;
    xdoc?: {
        markdown: RemarkNode;
        documentation: Partial<DocumentationNode>;
    };
}
export declare function createNode(file: IFile, node: SyntaxNode, properties?: Partial<NodeProperties>, document?: boolean): Node;
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
