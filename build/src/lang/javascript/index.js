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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy9qYXZhc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCxrREFBa0Q7QUFDbEQsb0RBQW9EO0FBRXBEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFJbkMsWUFBWSxJQUFZLEVBQUUsT0FBWTtRQU10QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsZ0RBQWdEO1lBQ2hELDJCQUEyQjtZQUMzQiw2Q0FBNkM7WUFDN0MsaURBQWlEO1lBQ2pELDhDQUE4QztZQUM5QyxnRUFBZ0U7WUFFaEUsNkNBQTZDO1lBQzdDLG9EQUFvRDtZQUNwRCwrQ0FBK0M7WUFDL0MsNkRBQTZEO1lBQzdELGdCQUFnQjtZQUNoQiw0Q0FBNEM7WUFDNUMsMkNBQTJDO1lBQzNDLDJDQUEyQztZQUMzQyw0Q0FBNEM7WUFDNUMsNkNBQTZDO1lBQzdDLDZDQUE2QztZQUM3QyxRQUFRO1lBQ1Isd0NBQXdDO1lBQ3hDLElBQUk7WUFDSixXQUFXO1lBQ1gscUJBQXFCO1lBQ3JCLGlFQUFpRTtZQUNqRSwrQkFBK0I7WUFDL0IsOEJBQThCO1lBQzlCLCtCQUErQjtZQUMvQixJQUFJO1lBQ0osT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDLENBQUE7UUFuQ0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FrRkY7QUEzRkQsbUNBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCAqIGFzIEphdmFTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItamF2YXNjcmlwdCc7XG5pbXBvcnQgSVBhcnNlciBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lQYXJzZXInO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG4vLyBpbXBvcnQgSVJlc3VsdCBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lSZXN1bHQnO1xuLy8gaW1wb3J0IElDb21tZW50IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSUNvbW1lbnQnO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cbiAqIFxuICogIyBBUElcbiAqIFxuICogYGBgXG4gKiBAY2xhc3MgSmF2YVNjcmlwdFBhcnNlclxuICogQGltcGxlbWVudHMgSVBhcnNlclxuICogQGV4cG9ydCBkZWZhdWx0XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSmF2YVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIElQYXJzZXIge1xuICBwcml2YXRlIGZpbGU6IFNvdXJjZTtcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XG4gIHByaXZhdGUgcGFyc2VyOiBQYXJzZXI7XG4gIGNvbnN0cnVjdG9yKGZpbGU6IFNvdXJjZSwgb3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5maWxlID0gZmlsZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIoKTtcbiAgICB0aGlzLnBhcnNlci5zZXRMYW5ndWFnZShKYXZhU2NyaXB0KTtcbiAgfVxuICBwYXJzZSA9ICgpID0+IHtcbiAgICAvLyBsZXQgdHJlZSA9IHRoaXMucGFyc2VyLnBhcnNlKHRoaXMuZmlsZS50ZXh0KTtcbiAgICAvLyAvLyBHZXQgdGhlIGZpcnN0IGNvbW1lbnRcbiAgICAvLyBsZXQgZmlyc3RfY29tbWVudCA9IHRyZWUucm9vdE5vZGUuY2hpbGRyZW5cbiAgICAvLyAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiY29tbWVudFwiKVswXTtcbiAgICAvLyBjb25zdCBmaXJzdF9jb21tZW50X3N0cmluZyA9IHRoaXMuZmlsZS50ZXh0XG4gICAgLy8gLnN1YnN0cmluZyhmaXJzdF9jb21tZW50LnN0YXJ0SW5kZXgsIGZpcnN0X2NvbW1lbnQuZW5kSW5kZXgpO1xuICAgIFxuICAgIC8vIC8vIFJlbW92ZSBhbnkgbGVnYWwgb3IgdW5uY2Vzc2FyeSBjb21tZW50c1xuICAgIC8vIGlmIChmaXJzdF9jb21tZW50X3N0cmluZy5pbmNsdWRlcyhcImNvcHlyaWdodFwiKSB8fFxuICAgIC8vICAgZmlyc3RfY29tbWVudF9zdHJpbmcuaW5jbHVkZXMoXCJhdXRob3JcIikgfHxcbiAgICAvLyAgIGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwidGVybXMgYW5kIGNvbmRpdGlvbnNcIikpIHtcbiAgICAvLyAgIHRyZWUuZWRpdCh7XG4gICAgLy8gICAgIHN0YXJ0SW5kZXg6IGZpcnN0X2NvbW1lbnQuc3RhcnRJbmRleCxcbiAgICAvLyAgICAgb2xkRW5kSW5kZXg6IGZpcnN0X2NvbW1lbnQuZW5kSW5kZXgsXG4gICAgLy8gICAgIG5ld0VuZEluZGV4OiBmaXJzdF9jb21tZW50LmVuZEluZGV4LFxuICAgIC8vICAgICBzdGFydFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXG4gICAgLy8gICAgIG9sZEVuZFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXG4gICAgLy8gICAgIG5ld0VuZFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXG4gICAgLy8gICB9KTtcbiAgICAvLyAgIHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSgnJywgdHJlZSk7XG4gICAgLy8gfVxuICAgIC8vIHJldHVybiB7XG4gICAgLy8gICBmaWxlOiB0aGlzLmZpbGUsXG4gICAgLy8gICBjb21tZW50czogQ29tbWVudFBhcnNlci5wYXJzZSh0cmVlLnJvb3ROb2RlLCB0aGlzLmZpbGUudGV4dClcbiAgICAvLyAgICAgLmZpbHRlcih0aGlzLmZpbHRlclR5cGUpXG4gICAgLy8gICAgIC8vIC5tYXAodGhpcy5jaGVja1R5cGUpXG4gICAgLy8gICAgIC5tYXAodGhpcy5wYXJzZUNoaWxkcmVuKVxuICAgIC8vIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBwcml2YXRlIGZpbHRlclR5cGUgPSAoY29tbWVudCk6IGJvb2xlYW4gPT4ge1xuICAvLyAgIHJldHVybiAodGhpcy5vcHRpb25zLmZpbHRlciB8fFxuICAvLyAgICAgW1xuICAvLyAgICAgICAnZnVuY3Rpb24nLFxuICAvLyAgICAgICAnY2xhc3MnLFxuICAvLyAgICAgICAndmFyaWFibGVfZGVjbGFyYXRpb24nXG4gIC8vICAgICBdKS5pbmNsdWRlcyhjb21tZW50LmNvbnRleHQudHlwZSlcbiAgLy8gfVxuXG4gIC8vIHByaXZhdGUgY2hlY2tUeXBlID0gKGNvbW1lbnQpID0+IHtcbiAgLy8gICBjb25zdCB0cmVlID0gdGhpcy5wYXJzZXIucGFyc2UoY29tbWVudC5jb250ZXh0LnRleHQpO1xuICAvLyAgIHN3aXRjaCAoY29tbWVudC5jb250ZXh0LnR5cGUpIHtcbiAgLy8gICAgIGNhc2UgJ3ZhcmlhYmxlX2RlY2xhcmF0aW9uJzpcbiAgLy8gICAgICAgLy8gQ2hlY2sgd2hldGhlciB3ZSBoYXZlIGFuIGFub255bW91cyBjbGFzc1xuICAvLyAgICAgICBpZiAoY29tbWVudC5jb250ZXh0LnRleHQuaW5jbHVkZXMoXCJjbGFzc1wiKSkge1xuICAvLyAgICAgICAgIC8vIERyaWxsIGRvd24gdW50aWwgd2UgZmluZCB0aGUgY2xhc3MgYm9keVxuICAvLyAgICAgICAgIGNvbnN0IHZhcmlhYmxlX2RlY2xhcmF0b3IgPSB0cmVlLnJvb3ROb2RlLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzFdO1xuICAvLyAgICAgICAgIGNvbnN0IGFub255bW91c19jbGFzcyA9IHZhcmlhYmxlX2RlY2xhcmF0b3IuY2hpbGRyZW5cbiAgLy8gICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiYW5vbnltb3VzX2NsYXNzXCIpWzBdXG4gIC8vICAgICAgICAgY29uc3QgY2xhc3NfYm9keSA9IGFub255bW91c19jbGFzcy5jaGlsZHJlblsxXTtcbiAgLy8gICAgICAgICBjb21tZW50LmNvbnRleHQuY2hpbGRyZW4gPSBDb21tZW50UGFyc2VyLnBhcnNlKFxuICAvLyAgICAgICAgICAgY2xhc3NfYm9keSxcbiAgLy8gICAgICAgICAgIGNvbW1lbnQuY29udGV4dC50ZXh0LFxuICAvLyAgICAgICAgICAgeyBsb2NhdGlvbjogY29tbWVudC5jb250ZXh0LmxvY2F0aW9uLCBwb3NpdGlvbjogY29tbWVudC5jb250ZXh0LnBvc2l0aW9uIH1cbiAgLy8gICAgICAgICApO1xuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGJyZWFrO1xuICAvLyAgICAgZGVmYXVsdDpcbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBjb21tZW50O1xuICAvLyB9XG5cbiAgLy8gcHJpdmF0ZSBwYXJzZUNoaWxkcmVuID0gKGNvbW1lbnQpID0+IHtcbiAgLy8gICBzd2l0Y2ggKGNvbW1lbnQuY29udGV4dC50eXBlKSB7XG4gIC8vICAgICBjYXNlICdjbGFzcyc6XG4gIC8vICAgICAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZShjb21tZW50LmNvbnRleHQudGV4dCk7XG4gIC8vICAgICAgIGNvbW1lbnQuY29udGV4dC5jaGlsZHJlbiA9IENvbW1lbnRQYXJzZXIucGFyc2UoXG4gIC8vICAgICAgICAgdHJlZS5yb290Tm9kZSxcbiAgLy8gICAgICAgICBjb21tZW50LmNvbnRleHQudGV4dCxcbiAgLy8gICAgICAgICB7IGxvY2F0aW9uOiBjb21tZW50LmNvbnRleHQubG9jYXRpb24sIHBvc2l0aW9uOiBjb21tZW50LmNvbnRleHQucG9zaXRpb24gfVxuICAvLyAgICAgICApLmZpbHRlcihjaGlsZCA9PiBjaGlsZC5jb250ZXh0LnR5cGUgPT09ICdtZXRob2RfZGVmaW5pdGlvbicpO1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGRlZmF1bHQ6XG4gIC8vICAgICAgIGJyZWFrO1xuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gY29tbWVudDtcbiAgLy8gfVxuXG59Il19