# Parser

[![Build Status](https://travis-ci.org/mr-doc/mr-doc-parser.svg?branch=master)](https://travis-ci.org/mr-doc/mr-doc-parser)

## Specification

A parser must implement the following interface:

```typescript
interface IParser {
  parse: (file: IFile) => IParseResult
}
```

The output should be in the following format:

```typescript

interface IParseResult {
  comments: IComment[],
  type: string,
  file: IFile
}

```

These interfaces are defined in `parser/interface.ts`.