import { SyntaxNode } from "tree-sitter";
import { Node } from "./visitors/visitor";
export default function walk(node: SyntaxNode): Node;
