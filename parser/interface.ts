import { SourceLocation } from "babel-types";

// export interface CommentContext {
//   location: { start: number, end: number }
// }
export interface IFile {
  name: string,
  source: string,
}


export interface ICommentType {
  type: 'leadingComments' | 'innerComments' | 'trailingComments'
  context: boolean
}

export interface ICommentContext {
  location: SourceLocation,
  code: string
}

export interface IComment {
  context: ICommentContext,
  value: string
  location: SourceLocation
}

export interface IParseResult {
  comments: IComment[],
  type: string,
  file: IFile
}

export default interface IParser {
  parse: (file: IFile) => IParseResult
}