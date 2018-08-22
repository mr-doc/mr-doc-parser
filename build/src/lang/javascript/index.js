"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");
// import IResult from '../../interfaces/IResult';
// import IComment from '../../interfaces/IComment';
/**
 * A class that parses JavaScript comments.
 *
 * # API
 *
 * ```
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 * ```
 */
class JavaScriptParser {
    constructor(file, options) {
        this.parse = () => {
            // let tree = this.parser.parse(this.file.text);
            // // Get the first comment
            // let first_comment = tree.rootNode.children
            //   .filter(node => node.type === "comment")[0];
            // const first_comment_string = this.file.text
            // .substring(first_comment.startIndex, first_comment.endIndex);
            // // Remove any legal or unncessary comments
            // if (first_comment_string.includes("copyright") ||
            //   first_comment_string.includes("author") ||
            //   first_comment_string.includes("terms and conditions")) {
            //   tree.edit({
            //     startIndex: first_comment.startIndex,
            //     oldEndIndex: first_comment.endIndex,
            //     newEndIndex: first_comment.endIndex,
            //     startPosition: { row: 0, column: 0 },
            //     oldEndPosition: { row: 0, column: 0 },
            //     newEndPosition: { row: 0, column: 0 },
            //   });
            //   tree = this.parser.parse('', tree);
            // }
            // return {
            //   file: this.file,
            //   comments: CommentParser.parse(tree.rootNode, this.file.text)
            //     .filter(this.filterType)
            //     // .map(this.checkType)
            //     .map(this.parseChildren)
            // }
            return [];
        };
        this.file = file;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(JavaScript);
    }
}
exports.default = JavaScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy9qYXZhc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCxrREFBa0Q7QUFDbEQsb0RBQW9EO0FBRXBEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFJbkMsWUFBWSxJQUFZLEVBQUUsT0FBWTtRQU10QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsZ0RBQWdEO1lBQ2hELDJCQUEyQjtZQUMzQiw2Q0FBNkM7WUFDN0MsaURBQWlEO1lBQ2pELDhDQUE4QztZQUM5QyxnRUFBZ0U7WUFFaEUsNkNBQTZDO1lBQzdDLG9EQUFvRDtZQUNwRCwrQ0FBK0M7WUFDL0MsNkRBQTZEO1lBQzdELGdCQUFnQjtZQUNoQiw0Q0FBNEM7WUFDNUMsMkNBQTJDO1lBQzNDLDJDQUEyQztZQUMzQyw0Q0FBNEM7WUFDNUMsNkNBQTZDO1lBQzdDLDZDQUE2QztZQUM3QyxRQUFRO1lBQ1Isd0NBQXdDO1lBQ3hDLElBQUk7WUFDSixXQUFXO1lBQ1gscUJBQXFCO1lBQ3JCLGlFQUFpRTtZQUNqRSwrQkFBK0I7WUFDL0IsOEJBQThCO1lBQzlCLCtCQUErQjtZQUMvQixJQUFJO1lBQ0osT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDLENBQUE7UUFuQ0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FrRkY7QUEzRkQsbUNBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcclxuaW1wb3J0ICogYXMgSmF2YVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci1qYXZhc2NyaXB0JztcclxuaW1wb3J0IElQYXJzZXIgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JUGFyc2VyJztcclxuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XHJcbi8vIGltcG9ydCBJUmVzdWx0IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSVJlc3VsdCc7XHJcbi8vIGltcG9ydCBJQ29tbWVudCBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lDb21tZW50JztcclxuXHJcbi8qKlxyXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIEphdmFTY3JpcHQgY29tbWVudHMuXHJcbiAqIFxyXG4gKiAjIEFQSVxyXG4gKiBcclxuICogYGBgXHJcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXHJcbiAqIEBpbXBsZW1lbnRzIElQYXJzZXJcclxuICogQGV4cG9ydCBkZWZhdWx0XHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSmF2YVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIElQYXJzZXIge1xyXG4gIHByaXZhdGUgZmlsZTogU291cmNlO1xyXG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xyXG4gIHByaXZhdGUgcGFyc2VyOiBQYXJzZXI7XHJcbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkpIHtcclxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcclxuICAgIHRoaXMucGFyc2VyID0gbmV3IFBhcnNlcigpO1xyXG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoSmF2YVNjcmlwdCk7XHJcbiAgfVxyXG4gIHBhcnNlID0gKCkgPT4ge1xyXG4gICAgLy8gbGV0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLmZpbGUudGV4dCk7XHJcbiAgICAvLyAvLyBHZXQgdGhlIGZpcnN0IGNvbW1lbnRcclxuICAgIC8vIGxldCBmaXJzdF9jb21tZW50ID0gdHJlZS5yb290Tm9kZS5jaGlsZHJlblxyXG4gICAgLy8gICAuZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlID09PSBcImNvbW1lbnRcIilbMF07XHJcbiAgICAvLyBjb25zdCBmaXJzdF9jb21tZW50X3N0cmluZyA9IHRoaXMuZmlsZS50ZXh0XHJcbiAgICAvLyAuc3Vic3RyaW5nKGZpcnN0X2NvbW1lbnQuc3RhcnRJbmRleCwgZmlyc3RfY29tbWVudC5lbmRJbmRleCk7XHJcbiAgICBcclxuICAgIC8vIC8vIFJlbW92ZSBhbnkgbGVnYWwgb3IgdW5uY2Vzc2FyeSBjb21tZW50c1xyXG4gICAgLy8gaWYgKGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwiY29weXJpZ2h0XCIpIHx8XHJcbiAgICAvLyAgIGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwiYXV0aG9yXCIpIHx8XHJcbiAgICAvLyAgIGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwidGVybXMgYW5kIGNvbmRpdGlvbnNcIikpIHtcclxuICAgIC8vICAgdHJlZS5lZGl0KHtcclxuICAgIC8vICAgICBzdGFydEluZGV4OiBmaXJzdF9jb21tZW50LnN0YXJ0SW5kZXgsXHJcbiAgICAvLyAgICAgb2xkRW5kSW5kZXg6IGZpcnN0X2NvbW1lbnQuZW5kSW5kZXgsXHJcbiAgICAvLyAgICAgbmV3RW5kSW5kZXg6IGZpcnN0X2NvbW1lbnQuZW5kSW5kZXgsXHJcbiAgICAvLyAgICAgc3RhcnRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxyXG4gICAgLy8gICAgIG9sZEVuZFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXHJcbiAgICAvLyAgICAgbmV3RW5kUG9zaXRpb246IHsgcm93OiAwLCBjb2x1bW46IDAgfSxcclxuICAgIC8vICAgfSk7XHJcbiAgICAvLyAgIHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSgnJywgdHJlZSk7XHJcbiAgICAvLyB9XHJcbiAgICAvLyByZXR1cm4ge1xyXG4gICAgLy8gICBmaWxlOiB0aGlzLmZpbGUsXHJcbiAgICAvLyAgIGNvbW1lbnRzOiBDb21tZW50UGFyc2VyLnBhcnNlKHRyZWUucm9vdE5vZGUsIHRoaXMuZmlsZS50ZXh0KVxyXG4gICAgLy8gICAgIC5maWx0ZXIodGhpcy5maWx0ZXJUeXBlKVxyXG4gICAgLy8gICAgIC8vIC5tYXAodGhpcy5jaGVja1R5cGUpXHJcbiAgICAvLyAgICAgLm1hcCh0aGlzLnBhcnNlQ2hpbGRyZW4pXHJcbiAgICAvLyB9XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICAvLyBwcml2YXRlIGZpbHRlclR5cGUgPSAoY29tbWVudCk6IGJvb2xlYW4gPT4ge1xyXG4gIC8vICAgcmV0dXJuICh0aGlzLm9wdGlvbnMuZmlsdGVyIHx8XHJcbiAgLy8gICAgIFtcclxuICAvLyAgICAgICAnZnVuY3Rpb24nLFxyXG4gIC8vICAgICAgICdjbGFzcycsXHJcbiAgLy8gICAgICAgJ3ZhcmlhYmxlX2RlY2xhcmF0aW9uJ1xyXG4gIC8vICAgICBdKS5pbmNsdWRlcyhjb21tZW50LmNvbnRleHQudHlwZSlcclxuICAvLyB9XHJcblxyXG4gIC8vIHByaXZhdGUgY2hlY2tUeXBlID0gKGNvbW1lbnQpID0+IHtcclxuICAvLyAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZShjb21tZW50LmNvbnRleHQudGV4dCk7XHJcbiAgLy8gICBzd2l0Y2ggKGNvbW1lbnQuY29udGV4dC50eXBlKSB7XHJcbiAgLy8gICAgIGNhc2UgJ3ZhcmlhYmxlX2RlY2xhcmF0aW9uJzpcclxuICAvLyAgICAgICAvLyBDaGVjayB3aGV0aGVyIHdlIGhhdmUgYW4gYW5vbnltb3VzIGNsYXNzXHJcbiAgLy8gICAgICAgaWYgKGNvbW1lbnQuY29udGV4dC50ZXh0LmluY2x1ZGVzKFwiY2xhc3NcIikpIHtcclxuICAvLyAgICAgICAgIC8vIERyaWxsIGRvd24gdW50aWwgd2UgZmluZCB0aGUgY2xhc3MgYm9keVxyXG4gIC8vICAgICAgICAgY29uc3QgdmFyaWFibGVfZGVjbGFyYXRvciA9IHRyZWUucm9vdE5vZGUuY2hpbGRyZW5bMF0uY2hpbGRyZW5bMV07XHJcbiAgLy8gICAgICAgICBjb25zdCBhbm9ueW1vdXNfY2xhc3MgPSB2YXJpYWJsZV9kZWNsYXJhdG9yLmNoaWxkcmVuXHJcbiAgLy8gICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiYW5vbnltb3VzX2NsYXNzXCIpWzBdXHJcbiAgLy8gICAgICAgICBjb25zdCBjbGFzc19ib2R5ID0gYW5vbnltb3VzX2NsYXNzLmNoaWxkcmVuWzFdO1xyXG4gIC8vICAgICAgICAgY29tbWVudC5jb250ZXh0LmNoaWxkcmVuID0gQ29tbWVudFBhcnNlci5wYXJzZShcclxuICAvLyAgICAgICAgICAgY2xhc3NfYm9keSxcclxuICAvLyAgICAgICAgICAgY29tbWVudC5jb250ZXh0LnRleHQsXHJcbiAgLy8gICAgICAgICAgIHsgbG9jYXRpb246IGNvbW1lbnQuY29udGV4dC5sb2NhdGlvbiwgcG9zaXRpb246IGNvbW1lbnQuY29udGV4dC5wb3NpdGlvbiB9XHJcbiAgLy8gICAgICAgICApO1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgICBicmVhaztcclxuICAvLyAgICAgZGVmYXVsdDpcclxuICAvLyAgICAgICBicmVhaztcclxuICAvLyAgIH1cclxuICAvLyAgIHJldHVybiBjb21tZW50O1xyXG4gIC8vIH1cclxuXHJcbiAgLy8gcHJpdmF0ZSBwYXJzZUNoaWxkcmVuID0gKGNvbW1lbnQpID0+IHtcclxuICAvLyAgIHN3aXRjaCAoY29tbWVudC5jb250ZXh0LnR5cGUpIHtcclxuICAvLyAgICAgY2FzZSAnY2xhc3MnOlxyXG4gIC8vICAgICAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZShjb21tZW50LmNvbnRleHQudGV4dCk7XHJcbiAgLy8gICAgICAgY29tbWVudC5jb250ZXh0LmNoaWxkcmVuID0gQ29tbWVudFBhcnNlci5wYXJzZShcclxuICAvLyAgICAgICAgIHRyZWUucm9vdE5vZGUsXHJcbiAgLy8gICAgICAgICBjb21tZW50LmNvbnRleHQudGV4dCxcclxuICAvLyAgICAgICAgIHsgbG9jYXRpb246IGNvbW1lbnQuY29udGV4dC5sb2NhdGlvbiwgcG9zaXRpb246IGNvbW1lbnQuY29udGV4dC5wb3NpdGlvbiB9XHJcbiAgLy8gICAgICAgKS5maWx0ZXIoY2hpbGQgPT4gY2hpbGQuY29udGV4dC50eXBlID09PSAnbWV0aG9kX2RlZmluaXRpb24nKTtcclxuICAvLyAgICAgICBicmVhaztcclxuICAvLyAgICAgZGVmYXVsdDpcclxuICAvLyAgICAgICBicmVhaztcclxuICAvLyAgIH1cclxuICAvLyAgIHJldHVybiBjb21tZW50O1xyXG4gIC8vIH1cclxuXHJcbn0iXX0=