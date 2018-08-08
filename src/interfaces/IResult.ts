import IFile from "./IFile";
import IComment from "./IComment";

export default interface IResult {
  file: IFile,
  comments: IComment[]
}