import TextRange from "./TextRange";
import { RemarkNode } from "xdoc-parser/src/XDocParser";
import { DocumentationNode } from "xdoc-parser/src/XDocASTNode";
export default interface ASTNode extends TextRange {
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
