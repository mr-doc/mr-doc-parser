import { DocumentationNode } from 'xdoc-parser/src/XDocASTNode';
import { RemarkNode } from 'xdoc-parser/src/XDocParser';
import { SyntaxNode } from "tree-sitter";
import Source from "../../interfaces/Source";
import TextRange from "../../interfaces/TextRange";
export interface ASTNode extends TextRange {
    /**
     * @property - The type of node.
     */
    type: string;
    /**
     * @property - The context string.
     */
    text: string;
    /**
     * @property - The node's children.
     */
    children: ASTNode[] | undefined[];
    /**
     * @property - The context node that a comment node refers to.
     */
    context: ASTNode;
    /**
     * @property - The properties that a ASTNode may possess.
     */
    properties?: object;
    /**
     * @property - The parsed XDoc comment.
     */
    comment?: {
        markdown: RemarkNode;
        documentation: Partial<DocumentationNode>;
    };
}
export declare function isASTNode(object: object): object is ASTNode;
export declare function createASTNode(source: Source, node: SyntaxNode): ASTNode;
export declare function createASTNode(source: Source, node: SyntaxNode, properties: object): any;
export declare function createASTNode(source: Source, node: SyntaxNode, children: object[]): ASTNode;
export declare function createASTNode(source: Source, node: SyntaxNode, children: object[], properties: object): any;
export declare function createASTNode(source: Source, node: SyntaxNode, context: ASTNode, document: boolean): ASTNode;
