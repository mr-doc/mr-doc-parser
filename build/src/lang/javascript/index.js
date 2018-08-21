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
        };
        this.file = file;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(JavaScript);
    }
}
exports.default = JavaScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy9qYXZhc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCxrREFBa0Q7QUFDbEQsb0RBQW9EO0FBRXBEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFJbkMsWUFBWSxJQUFZLEVBQUUsT0FBWTtRQU10QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsZ0RBQWdEO1lBQ2hELDJCQUEyQjtZQUMzQiw2Q0FBNkM7WUFDN0MsaURBQWlEO1lBQ2pELDhDQUE4QztZQUM5QyxnRUFBZ0U7WUFFaEUsNkNBQTZDO1lBQzdDLG9EQUFvRDtZQUNwRCwrQ0FBK0M7WUFDL0MsNkRBQTZEO1lBQzdELGdCQUFnQjtZQUNoQiw0Q0FBNEM7WUFDNUMsMkNBQTJDO1lBQzNDLDJDQUEyQztZQUMzQyw0Q0FBNEM7WUFDNUMsNkNBQTZDO1lBQzdDLDZDQUE2QztZQUM3QyxRQUFRO1lBQ1Isd0NBQXdDO1lBQ3hDLElBQUk7WUFDSixXQUFXO1lBQ1gscUJBQXFCO1lBQ3JCLGlFQUFpRTtZQUNqRSwrQkFBK0I7WUFDL0IsOEJBQThCO1lBQzlCLCtCQUErQjtZQUMvQixJQUFJO1FBQ04sQ0FBQyxDQUFBO1FBbENDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBZ0ZGO0FBekZELG1DQXlGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFBhcnNlciBmcm9tICd0cmVlLXNpdHRlcic7XG5pbXBvcnQgKiBhcyBKYXZhU2NyaXB0IGZyb20gJ3RyZWUtc2l0dGVyLWphdmFzY3JpcHQnO1xuaW1wb3J0IElQYXJzZXIgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JUGFyc2VyJztcbmltcG9ydCBTb3VyY2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2UnO1xuLy8gaW1wb3J0IElSZXN1bHQgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JUmVzdWx0Jztcbi8vIGltcG9ydCBJQ29tbWVudCBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lDb21tZW50JztcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIEphdmFTY3JpcHQgY29tbWVudHMuXG4gKiBcbiAqICMgQVBJXG4gKiBcbiAqIGBgYFxuICogQGNsYXNzIEphdmFTY3JpcHRQYXJzZXJcbiAqIEBpbXBsZW1lbnRzIElQYXJzZXJcbiAqIEBleHBvcnQgZGVmYXVsdFxuICogYGBgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEphdmFTY3JpcHRQYXJzZXIgaW1wbGVtZW50cyBJUGFyc2VyIHtcbiAgcHJpdmF0ZSBmaWxlOiBTb3VyY2U7XG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xuICBwcml2YXRlIHBhcnNlcjogUGFyc2VyO1xuICBjb25zdHJ1Y3RvcihmaWxlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMgPSB7fSwgb3B0aW9ucyB8fCB7fSk7XG4gICAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKCk7XG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoSmF2YVNjcmlwdCk7XG4gIH1cbiAgcGFyc2UgPSAoKSA9PiB7XG4gICAgLy8gbGV0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLmZpbGUudGV4dCk7XG4gICAgLy8gLy8gR2V0IHRoZSBmaXJzdCBjb21tZW50XG4gICAgLy8gbGV0IGZpcnN0X2NvbW1lbnQgPSB0cmVlLnJvb3ROb2RlLmNoaWxkcmVuXG4gICAgLy8gICAuZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlID09PSBcImNvbW1lbnRcIilbMF07XG4gICAgLy8gY29uc3QgZmlyc3RfY29tbWVudF9zdHJpbmcgPSB0aGlzLmZpbGUudGV4dFxuICAgIC8vIC5zdWJzdHJpbmcoZmlyc3RfY29tbWVudC5zdGFydEluZGV4LCBmaXJzdF9jb21tZW50LmVuZEluZGV4KTtcbiAgICBcbiAgICAvLyAvLyBSZW1vdmUgYW55IGxlZ2FsIG9yIHVubmNlc3NhcnkgY29tbWVudHNcbiAgICAvLyBpZiAoZmlyc3RfY29tbWVudF9zdHJpbmcuaW5jbHVkZXMoXCJjb3B5cmlnaHRcIikgfHxcbiAgICAvLyAgIGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwiYXV0aG9yXCIpIHx8XG4gICAgLy8gICBmaXJzdF9jb21tZW50X3N0cmluZy5pbmNsdWRlcyhcInRlcm1zIGFuZCBjb25kaXRpb25zXCIpKSB7XG4gICAgLy8gICB0cmVlLmVkaXQoe1xuICAgIC8vICAgICBzdGFydEluZGV4OiBmaXJzdF9jb21tZW50LnN0YXJ0SW5kZXgsXG4gICAgLy8gICAgIG9sZEVuZEluZGV4OiBmaXJzdF9jb21tZW50LmVuZEluZGV4LFxuICAgIC8vICAgICBuZXdFbmRJbmRleDogZmlyc3RfY29tbWVudC5lbmRJbmRleCxcbiAgICAvLyAgICAgc3RhcnRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxuICAgIC8vICAgICBvbGRFbmRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxuICAgIC8vICAgICBuZXdFbmRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxuICAgIC8vICAgfSk7XG4gICAgLy8gICB0cmVlID0gdGhpcy5wYXJzZXIucGFyc2UoJycsIHRyZWUpO1xuICAgIC8vIH1cbiAgICAvLyByZXR1cm4ge1xuICAgIC8vICAgZmlsZTogdGhpcy5maWxlLFxuICAgIC8vICAgY29tbWVudHM6IENvbW1lbnRQYXJzZXIucGFyc2UodHJlZS5yb290Tm9kZSwgdGhpcy5maWxlLnRleHQpXG4gICAgLy8gICAgIC5maWx0ZXIodGhpcy5maWx0ZXJUeXBlKVxuICAgIC8vICAgICAvLyAubWFwKHRoaXMuY2hlY2tUeXBlKVxuICAgIC8vICAgICAubWFwKHRoaXMucGFyc2VDaGlsZHJlbilcbiAgICAvLyB9XG4gIH1cblxuICAvLyBwcml2YXRlIGZpbHRlclR5cGUgPSAoY29tbWVudCk6IGJvb2xlYW4gPT4ge1xuICAvLyAgIHJldHVybiAodGhpcy5vcHRpb25zLmZpbHRlciB8fFxuICAvLyAgICAgW1xuICAvLyAgICAgICAnZnVuY3Rpb24nLFxuICAvLyAgICAgICAnY2xhc3MnLFxuICAvLyAgICAgICAndmFyaWFibGVfZGVjbGFyYXRpb24nXG4gIC8vICAgICBdKS5pbmNsdWRlcyhjb21tZW50LmNvbnRleHQudHlwZSlcbiAgLy8gfVxuXG4gIC8vIHByaXZhdGUgY2hlY2tUeXBlID0gKGNvbW1lbnQpID0+IHtcbiAgLy8gICBjb25zdCB0cmVlID0gdGhpcy5wYXJzZXIucGFyc2UoY29tbWVudC5jb250ZXh0LnRleHQpO1xuICAvLyAgIHN3aXRjaCAoY29tbWVudC5jb250ZXh0LnR5cGUpIHtcbiAgLy8gICAgIGNhc2UgJ3ZhcmlhYmxlX2RlY2xhcmF0aW9uJzpcbiAgLy8gICAgICAgLy8gQ2hlY2sgd2hldGhlciB3ZSBoYXZlIGFuIGFub255bW91cyBjbGFzc1xuICAvLyAgICAgICBpZiAoY29tbWVudC5jb250ZXh0LnRleHQuaW5jbHVkZXMoXCJjbGFzc1wiKSkge1xuICAvLyAgICAgICAgIC8vIERyaWxsIGRvd24gdW50aWwgd2UgZmluZCB0aGUgY2xhc3MgYm9keVxuICAvLyAgICAgICAgIGNvbnN0IHZhcmlhYmxlX2RlY2xhcmF0b3IgPSB0cmVlLnJvb3ROb2RlLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzFdO1xuICAvLyAgICAgICAgIGNvbnN0IGFub255bW91c19jbGFzcyA9IHZhcmlhYmxlX2RlY2xhcmF0b3IuY2hpbGRyZW5cbiAgLy8gICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiYW5vbnltb3VzX2NsYXNzXCIpWzBdXG4gIC8vICAgICAgICAgY29uc3QgY2xhc3NfYm9keSA9IGFub255bW91c19jbGFzcy5jaGlsZHJlblsxXTtcbiAgLy8gICAgICAgICBjb21tZW50LmNvbnRleHQuY2hpbGRyZW4gPSBDb21tZW50UGFyc2VyLnBhcnNlKFxuICAvLyAgICAgICAgICAgY2xhc3NfYm9keSxcbiAgLy8gICAgICAgICAgIGNvbW1lbnQuY29udGV4dC50ZXh0LFxuICAvLyAgICAgICAgICAgeyBsb2NhdGlvbjogY29tbWVudC5jb250ZXh0LmxvY2F0aW9uLCBwb3NpdGlvbjogY29tbWVudC5jb250ZXh0LnBvc2l0aW9uIH1cbiAgLy8gICAgICAgICApO1xuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGJyZWFrO1xuICAvLyAgICAgZGVmYXVsdDpcbiAgLy8gICAgICAgYnJlYWs7XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBjb21tZW50O1xuICAvLyB9XG5cbiAgLy8gcHJpdmF0ZSBwYXJzZUNoaWxkcmVuID0gKGNvbW1lbnQpID0+IHtcbiAgLy8gICBzd2l0Y2ggKGNvbW1lbnQuY29udGV4dC50eXBlKSB7XG4gIC8vICAgICBjYXNlICdjbGFzcyc6XG4gIC8vICAgICAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZShjb21tZW50LmNvbnRleHQudGV4dCk7XG4gIC8vICAgICAgIGNvbW1lbnQuY29udGV4dC5jaGlsZHJlbiA9IENvbW1lbnRQYXJzZXIucGFyc2UoXG4gIC8vICAgICAgICAgdHJlZS5yb290Tm9kZSxcbiAgLy8gICAgICAgICBjb21tZW50LmNvbnRleHQudGV4dCxcbiAgLy8gICAgICAgICB7IGxvY2F0aW9uOiBjb21tZW50LmNvbnRleHQubG9jYXRpb24sIHBvc2l0aW9uOiBjb21tZW50LmNvbnRleHQucG9zaXRpb24gfVxuICAvLyAgICAgICApLmZpbHRlcihjaGlsZCA9PiBjaGlsZC5jb250ZXh0LnR5cGUgPT09ICdtZXRob2RfZGVmaW5pdGlvbicpO1xuICAvLyAgICAgICBicmVhaztcbiAgLy8gICAgIGRlZmF1bHQ6XG4gIC8vICAgICAgIGJyZWFrO1xuICAvLyAgIH1cbiAgLy8gICByZXR1cm4gY29tbWVudDtcbiAgLy8gfVxufSJdfQ==