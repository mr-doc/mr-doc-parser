import { isJavaDocComment, isLegalComment } from "../../../utils/comment";
import { SyntaxNode } from "tree-sitter";
import { visitNode } from "./node.visitor";
import IFile from "../../../interfaces/IFile";
import match from "../../../utils/match";

export function visitProgram(source: IFile, node: SyntaxNode) {
  let children = node.children;
  if (node.children.length > 0) {
    if (isLegalComment(source, node.children[0])) {
      // Remove the legal comment from ast
      children = node.children.splice(1);
    }
    // Perf: O(n)
    return children.map(child => {
      const nextSibling = child.nextSibling;
      // Determine if the node is a c-style comment
      if (match(child, 'comment') && isJavaDocComment(source, child)) {
        // Determine whether a comment has a sibling
        if (nextSibling) {
          // Visit the sibling
          // Perf: Possibly O(n^2)
          return visitNode(source, nextSibling, child, {
            exports: {
              export: false,
              default: false
            }
          });
        }
      }
    }).filter(child => !!child);
  }
}