'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mr_doc_utils_1 = require("mr-doc-utils");
const babylon_1 = require("babylon");
const babel_core_1 = require("babel-core");
const { Log } = mr_doc_utils_1.default;
const log = new Log();
class JavaScript {
    constructor() {
        this.visited = new Map();
        this.comments = [];
        this.docs = [];
    }
    /**
     * Parse the file.
     * @param {Object} - The file to parse.
     */
    parse(file) {
        this.file = file;
        this.ast = babylon_1.parse(file.source, {
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
        let types = [
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
    walk(commentType) {
        babel_core_1.traverse(this.ast, {
            enter: path => {
                const parseComment = (comment) => {
                    const result = this.addComment(path, comment, commentType.context);
                    if (result.context.code !== '')
                        this.docs.push(result);
                };
                let key = commentType.type;
                (path.node[key] || []).filter((comment) => {
                    return 'type' in comment && comment.type === 'CommentBlock';
                }).forEach(parseComment);
            }
        });
    }
    addComment(path, comment, includeContext) {
        let file = this.file;
        let key = file.name + ':' + comment.loc.start.line + ':' + comment.loc.start.column;
        let context = {
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
exports.default = JavaScript;
//# sourceMappingURL=index.js.map