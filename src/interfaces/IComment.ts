import IFile from "./IFile";
import { RemarkNode } from 'xdoc-parser/src/XDocParser'
export interface Position {
  start: number,
  end: number;
}

export interface Location {
  start: { row: number, column: number },
  end: { row: number, column: number }
}

export default interface IComment {
  position: Position,
  location: Location,
  markdown: RemarkNode[],
  text: string
  context: {
    position: Position,
    location: Location,
    text: string,
    type: string,
    children: IComment[] | undefined[]
  }
}