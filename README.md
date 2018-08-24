# mr-doc-parser

[![Build Status](https://travis-ci.org/mr-doc/mr-doc-parser.svg?branch=master)](https://travis-ci.org/mr-doc/mr-doc-parser)

## Introduction

This is the official parser for Mr. Doc. The parser uses [node-tree-sitter](https://github.com/tree-sitter/node-tree-sitter) to parse different programming languages. It also uses [xdoc-parser](https://github.com/iwatakeshi/xdoc-parser) to parse JSDoc-like syntaxes in a comment. Note that `mr-doc-parser` is in alpha. Thus, the algorithms may change over time. At the moment, there are two languages that are supported by `mr-doc-parser`: JavaScript and TypeScript. More languages can be added as long as [tree-sitter](https://github.com/tree-sitter) can parse them.

## Creating a Language Parser

### Extend the Language Parser

To create a parser, simply extend an abstract class named `Parser` in `src/lang/common/parser.ts`:

```typescript
abstract class Parser {
  constructor(source: Source, options: any) {/* ... */}
  abstract parse(): ASTNode[]
  abstract get tree(): Tree
}
```

### Implement the Language Visitor

The next step is to walk the tree that parsed by `tree-sitter` and to wrap each node as an `Node` type.
Bear in mind that `tree-sitter` keeps its tree as a DOM-like structure.

It may seem like an additional step to re-wrap the nodes, but it is a necessary step to make visiting each node a bit easier:

```ts
// Example for JavaScript
import * as Parser from 'tree-sitter';
import * as JavaScript from 'tree-sitter-javascript';
import walk from 'path to [src/utils/walk]'

// Create the parser
const parser = new Parser();
// Set the langauge
parser.setLangauge(JavaScript);
// Parse the source code
const tree = parser.parse('...');
// Walk the tree
const nodes = walk(tree);

```

Once the tree is wrapped, we need to implement the abstract `Visitor` visitor:

```ts
abstract class Visitor {
  abstract getAST(): ASTNode[]
  abstract visitNode(node: SyntaxNode, properties?: object): ASTNode
  abstract visitChildren(nodes: SyntaxNode[], properties?: object): ASTNode[]
}
```

**Note**: See the [JavaScript visitor](./src/lang/javascript/visitor.ts) for an example.

### Return the AST

The last step is to return the AST. To do so, simply use the `createNode` function and return an array of `ASTNode` type:

```typescript

interface ASTNode extends TextRange {
  /**
   * @property - The type of node.
   */
  type: string,
  /**
   * @property - The context string.
   */
  text: string,
  /**
   * @property - The node's children.
   */
  children: ASTNode[] | undefined[],
  /**
   * @property - The context node that a comment node refers to.
   */
  context: ASTNode,
  /**
   * @property - The properties that a ASTNode may possess.
   */
  properties?: object
  /**
   * @property - The parsed XDoc comment.
   */
  comment?: {
    markdown: RemarkNode,
    documentation: Partial<DocumentationNode>
  }
}

```
