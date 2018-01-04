'use strict';
import * as _ from "lodash";
import Util from 'mr-doc-utils';
import { File, Comment, CommentBlock, CommentLine } from 'babel-types';
import { parse } from 'babylon';
import { traverse } from 'babel-core';
import { IParser, IParseResult, ICommentType, ICommentContext, IComment } from '../interface';
import { NodePath, Node } from "babel-traverse";

const { Log } = Util;
const log = new Log();

export default class JavaScript implements IParser {
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
    log.debug(Log.color.blue(`Parsing Javascript file: ${file.name}`));
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
        let type: (keyof Node) = commentType.type;
        const parseComment = (comment: Comment) => {
          const result = this.addComment(path, comment, commentType.context);
          if (result.context.code !== '')
            this.docs.push(result);
        };

        (path.node[type] || []).filter((comment: CommentBlock | CommentLine | Comment) => {
          return 'type' in comment && (<CommentBlock>comment).type === 'CommentBlock';
        }).forEach(parseComment);
      }
    });
  }
  
  private addComment(path: NodePath, comment: CommentBlock | CommentLine | Comment, includeContext: boolean): IComment {
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
      
      // Normalize the comments since bable strips
      // the markers (/*, */, //)
      switch((<CommentBlock | CommentLine>comment).type) {
        case 'CommentBlock': comment.value = `/*${comment.value}*/`;
        break;
        case 'CommentLine': comment.value = `//${comment.value}`;
      }

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