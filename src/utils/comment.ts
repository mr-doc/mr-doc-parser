import { SyntaxNode } from "tree-sitter";
import match from "./match";
import Source from "../interfaces/Source";

export const XDocRegex = /@(\w+)([^{[(\n]*)?([\{\[\(][\s\S]*[\}\]\)]([\s]*(=|-)>.*)?)?([\s]*-(.)*)?/gmi;

export function isLegalComment (source: Source, node: SyntaxNode) {
  const possibleTexts = [
    'copyright',
    'terms and conditions',
    'license',
    'all rights reserved'
  ];
  if (match(node, 'comment')) {
    return possibleTexts.map(text =>
      source.text
        .substring(node.startIndex, node.endIndex)
        .toLowerCase()
        .includes(text)
    ).includes(true);
  }
}

export function isJavaDocComment(source: Source, node: SyntaxNode) {
  const comment = source.text.substring(node.startIndex, node.endIndex);
  // regexr.com/3ejvb
  return /(\/\*\*)((\s*)(.*?)(\s))*(\*\/)/.test(comment)
}

export function isXDocComment(source:string, node?: SyntaxNode) {
  let comment = source;
  if (node) comment = source.substring(node.startIndex, node.endIndex);
  return XDocRegex.test(comment);
}

export function isXDocCommentBlock(source: string, node: SyntaxNode) {
  const comment = source.substring(node.startIndex, node.endIndex);
  return /#API/.test(comment) || /\`\`\`xdoc/.test(comment)
}

export function isXDocCommentFragment(source: string, node: SyntaxNode) {
  return !isXDocCommentBlock(source, node) && isXDocComment(source, node);
}