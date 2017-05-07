'use strict';

const Babylon = require('babylon');
const Acorn = require('acorn');
const Espree = require('espree');
const ESCodeGen = require('escodegen');
const ESTraverse = require('estraverse');
const traverse = require('babel-traverse').default;

const opts = {
  acorn: (version, comments, tokens) => ({
    // ecmaVersion: version,
    // collect ranges for each node
    ranges: true,
    // collect comments in Esprima's format
    onComment: comments,
    // collect token ranges
    onToken: tokens,
  }),
  babylon: () => ({
    allowImportExportEverywhere: true,
    plugins: [
      'jsx',
      'flow',
      'asyncFunctions',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent',
    ],
    sourceType: 'module',
  }),
  espree: version => ({
    attachComment: true,
    comment: true,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      globalReturn: true,
      impliedStrict: true,
      jsx: true,
    },
    ecmaVersion: version,
    loc: true,
    range: true,
    sourceType: 'module',
    tokens: true,
  }),
};

class Engine {
  constructor(options) {
    this.options = options;
  }
  parse(file) {
    const comments = [];
    const tokens = [];
    try {
      switch (this.options.engine) {
        case 'acorn':
          return ESCodeGen.attachComments(Acorn.parse(file.source,
            opts.acorn(this.options.version, comments, tokens)), comments, tokens);
        case 'espree':
          return Espree.parse(file.source, opts.espree(this.options.version));
        default:
          return Babylon.parse(file.source, opts.babylon());
      }
    } catch (error) {
      throw error;
    }
  }
  static traverse(options, ast, callback) {
    switch (options.engine) {
      case 'babylon':
        traverse(ast, {
          enter: (path) => {
            const node = path.node;
            callback(node);
          },
        });
        break;
      default:
        ESTraverse.traverse(ast.program, {
          /* eslint-disable no-param-reassign, no-console, object-shorthand */
          enter: function (node) {
            if (node && node.type === 'Program') {
              node = node.body[0];
            }
            if (node && node.type === 'File') {
              this.skip();
            }
            if (node && ['StringLiteral', 'classMethod'].indexOf(node.type) > -1) {
              callback(node);
              this.skip();
            }
            callback(node);
          },
        });
      /* eslint-enable no-param-reassign, no-console, object-shorthand */
      // break;
    }
  }
}
module.exports = Engine;
