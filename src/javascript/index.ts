'use strict';
import * as _ from "lodash";
import * as Utils from 'mr-doc-utils';
import { File, Comment, CommentBlock, CommentLine } from 'babel-types';
import { parse } from 'babylon';
import { traverse } from 'babel-core';
import Parser, { IParseResult, ICommentType, ICommentContext, IComment } from '../interface';
import { NodePath, Node } from "babel-traverse";

const { Log } = Utils;
const log = new Log();

export default class JavaScript implements Parser {
  private visited = new Map<string, boolean>();
  private comments = [];
  private docs: IComment[] = [];
  private ast: File;
  private file: { name: string, source: string };
  /**
   * Parse the file.
   * @param {Object} - The file to parse.
   */
  parse(file: { name: string, source: string }): IParseResult {
    this.file = file
    this.ast = parse(file.source, {
      allowImportExportEverywhere: true,
      sourceType: 'module',
      plugins: [
        'asyncGenerators',
        'classConstructorCall',
        'classProperties',
        'decorators',
        'doExpressions',
        'exportExtensions',
        'flow',
        'functionBind',
        'functionSent',
        'jsx',
        'objectRestSpread',
        'dynamicImport'
      ]
    });
    // DEBUG: AST
    log.debug(Log.color.blue('Length of AST:'), this.ast.program);
    let types: ICommentType[] = [
      { type: 'leadingComments', context: true },
      { type: 'innerComments', context: false },
      { type: 'trailingComments', context: false },
    ];
    types.forEach(commentType => this.walk(commentType));
    return { type: 'module', file, comments: this.docs };
  }
  /**
   * Walk the comments.
   * @param {Object} - The comment type and context to walk.
   */
  private walk(commentType: ICommentType) {
    traverse(this.ast, {
      enter: path => {
        const parseComment = (comment: Comment) => {
          const result = this.addComment(path, comment, commentType.context);
          if (result.context.code !== '')
            this.docs.push(result);
        };

        let key: (keyof Node) = commentType.type;
        (path.node[key] || []).filter((comment: CommentBlock | CommentLine | Comment) => {
          return 'type' in comment && (<CommentBlock>comment).type === 'CommentBlock';
        }).forEach(parseComment);
      }
    });
  }

  private addComment(path: NodePath, comment: Comment, includeContext: boolean): IComment {
    let file = this.file;
    let key = file.name + ':' + comment.loc.start.line + ':' + comment.loc.start.column;
    let context: ICommentContext = {
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 0 },
      },
      code: ''
    };
    if (!this.visited.get(key)) {
      this.visited.set(key, true);

      context = {
        location: path.node.loc,
        code: ''
      };

      if (includeContext) {
        Object.defineProperty(context, 'ast', {
          configurable: true,
          enumerable: false,
          value: path,
        });
      }

      if (path.parentPath && path.parentPath.node) {
        let parentNode = path.parentPath.node;
        context.code = this.file.source.substring(parentNode.start, parentNode.end);
      }
    }
    return { context, value: comment.value, location: comment.loc };
  }
}