"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");
const CommentParser_1 = require("../../CommentParser");
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
            let tree = this.parser.parse(this.file.text);
            // Get the first comment
            let first_comment = tree.rootNode.children
                .filter(node => node.type === "comment")[0];
            const first_comment_string = this.file.text
                .substring(first_comment.startIndex, first_comment.endIndex);
            // Remove any legal or unncessary comments
            if (first_comment_string.includes("copyright") ||
                first_comment_string.includes("author") ||
                first_comment_string.includes("terms and conditions")) {
                tree.edit({
                    startIndex: first_comment.startIndex,
                    oldEndIndex: first_comment.endIndex,
                    newEndIndex: first_comment.endIndex,
                    startPosition: { row: 0, column: 0 },
                    oldEndPosition: { row: 0, column: 0 },
                    newEndPosition: { row: 0, column: 0 },
                });
                tree = this.parser.parse('', tree);
            }
            return {
                file: this.file,
                comments: CommentParser_1.default.parse(tree.rootNode, this.file.text)
                    .filter(this.filterType)
                    // .map(this.checkType)
                    .map(this.parseChildren)
            };
        };
        this.filterType = (comment) => {
            return (this.options.filter ||
                [
                    'function',
                    'class',
                    'variable_declaration'
                ]).includes(comment.context.type);
        };
        this.checkType = (comment) => {
            const tree = this.parser.parse(comment.context.text);
            switch (comment.context.type) {
                case 'variable_declaration':
                    // Check whether we have an anonymous class
                    if (comment.context.text.includes("class")) {
                        // Drill down until we find the class body
                        const variable_declarator = tree.rootNode.children[0].children[1];
                        const anonymous_class = variable_declarator.children
                            .filter(node => node.type === "anonymous_class")[0];
                        const class_body = anonymous_class.children[1];
                        comment.context.children = CommentParser_1.default.parse(class_body, comment.context.text, { location: comment.context.location, position: comment.context.position });
                    }
                    break;
                default:
                    break;
            }
            return comment;
        };
        this.parseChildren = (comment) => {
            switch (comment.context.type) {
                case 'class':
                    const tree = this.parser.parse(comment.context.text);
                    comment.context.children = CommentParser_1.default.parse(tree.rootNode, comment.context.text, { location: comment.context.location, position: comment.context.position }).filter(child => child.context.type === 'method_definition');
                    break;
                default:
                    break;
            }
            return comment;
        };
        this.file = file;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(JavaScript);
    }
}
exports.default = JavaScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy9qYXZhc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUlyRCx1REFBZ0Q7QUFHaEQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQXFCLGdCQUFnQjtJQUluQyxZQUFZLElBQVcsRUFBRSxPQUFZO1FBTXJDLFVBQUssR0FBRyxHQUFZLEVBQUU7WUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3Qyx3QkFBd0I7WUFDeEIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRO2lCQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO2lCQUMxQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFN0QsMENBQTBDO1lBQzFDLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnQkFDNUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFDdkMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7Z0JBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ1IsVUFBVSxFQUFFLGFBQWEsQ0FBQyxVQUFVO29CQUNwQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFFBQVE7b0JBQ25DLFdBQVcsRUFBRSxhQUFhLENBQUMsUUFBUTtvQkFDbkMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO29CQUNwQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7b0JBQ3JDLGNBQWMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtpQkFDdEMsQ0FBQyxDQUFDO2dCQUNILElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPO2dCQUNMLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixRQUFRLEVBQUUsdUJBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztxQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQ3hCLHVCQUF1QjtxQkFDdEIsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7YUFDM0IsQ0FBQTtRQUNILENBQUMsQ0FBQTtRQUVPLGVBQVUsR0FBRyxDQUFDLE9BQWlCLEVBQVcsRUFBRTtZQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO2dCQUN6QjtvQkFDRSxVQUFVO29CQUNWLE9BQU87b0JBQ1Asc0JBQXNCO2lCQUN2QixDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckMsQ0FBQyxDQUFBO1FBRU8sY0FBUyxHQUFHLENBQUMsT0FBaUIsRUFBWSxFQUFFO1lBQ2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckQsUUFBUSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxzQkFBc0I7b0JBQ3pCLDJDQUEyQztvQkFDM0MsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQzFDLDBDQUEwQzt3QkFDMUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xFLE1BQU0sZUFBZSxHQUFHLG1CQUFtQixDQUFDLFFBQVE7NkJBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTt3QkFDckQsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsdUJBQWEsQ0FBQyxLQUFLLENBQzVDLFVBQVUsRUFDVixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFDcEIsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQzNFLENBQUM7cUJBQ0g7b0JBQ0QsTUFBTTtnQkFDUjtvQkFDRSxNQUFNO2FBQ1Q7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDLENBQUE7UUFFTyxrQkFBYSxHQUFHLENBQUMsT0FBaUIsRUFBWSxFQUFFO1lBQ3RELFFBQVEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQzVCLEtBQUssT0FBTztvQkFDVixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNyRCxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyx1QkFBYSxDQUFDLEtBQUssQ0FDNUMsSUFBSSxDQUFDLFFBQVEsRUFDYixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFDcEIsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQzNFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssbUJBQW1CLENBQUMsQ0FBQztvQkFDOUQsTUFBTTtnQkFDUjtvQkFDRSxNQUFNO2FBQ1Q7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDLENBQUE7UUFuRkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FnRkY7QUF6RkQsbUNBeUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCAqIGFzIEphdmFTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItamF2YXNjcmlwdCc7XG5pbXBvcnQgSVBhcnNlciBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lQYXJzZXInO1xuaW1wb3J0IElGaWxlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSUZpbGUnO1xuaW1wb3J0IElSZXN1bHQgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JUmVzdWx0JztcbmltcG9ydCBDb21tZW50UGFyc2VyIGZyb20gJy4uLy4uL0NvbW1lbnRQYXJzZXInO1xuaW1wb3J0IElDb21tZW50IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSUNvbW1lbnQnO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cbiAqIFxuICogIyBBUElcbiAqIFxuICogYGBgXG4gKiBAY2xhc3MgSmF2YVNjcmlwdFBhcnNlclxuICogQGltcGxlbWVudHMgSVBhcnNlclxuICogQGV4cG9ydCBkZWZhdWx0XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSmF2YVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIElQYXJzZXIge1xuICBwcml2YXRlIGZpbGU6IElGaWxlO1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcbiAgY29uc3RydWN0b3IoZmlsZTogSUZpbGUsIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMgPSB7fSwgb3B0aW9ucyB8fCB7fSk7XG4gICAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKCk7XG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoSmF2YVNjcmlwdCk7XG4gIH1cbiAgcGFyc2UgPSAoKTogSVJlc3VsdCA9PiB7XG4gICAgbGV0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLmZpbGUudGV4dCk7XG4gICAgLy8gR2V0IHRoZSBmaXJzdCBjb21tZW50XG4gICAgbGV0IGZpcnN0X2NvbW1lbnQgPSB0cmVlLnJvb3ROb2RlLmNoaWxkcmVuXG4gICAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlID09PSBcImNvbW1lbnRcIilbMF07XG4gICAgY29uc3QgZmlyc3RfY29tbWVudF9zdHJpbmcgPSB0aGlzLmZpbGUudGV4dFxuICAgIC5zdWJzdHJpbmcoZmlyc3RfY29tbWVudC5zdGFydEluZGV4LCBmaXJzdF9jb21tZW50LmVuZEluZGV4KTtcbiAgICBcbiAgICAvLyBSZW1vdmUgYW55IGxlZ2FsIG9yIHVubmNlc3NhcnkgY29tbWVudHNcbiAgICBpZiAoZmlyc3RfY29tbWVudF9zdHJpbmcuaW5jbHVkZXMoXCJjb3B5cmlnaHRcIikgfHxcbiAgICAgIGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwiYXV0aG9yXCIpIHx8XG4gICAgICBmaXJzdF9jb21tZW50X3N0cmluZy5pbmNsdWRlcyhcInRlcm1zIGFuZCBjb25kaXRpb25zXCIpKSB7XG4gICAgICB0cmVlLmVkaXQoe1xuICAgICAgICBzdGFydEluZGV4OiBmaXJzdF9jb21tZW50LnN0YXJ0SW5kZXgsXG4gICAgICAgIG9sZEVuZEluZGV4OiBmaXJzdF9jb21tZW50LmVuZEluZGV4LFxuICAgICAgICBuZXdFbmRJbmRleDogZmlyc3RfY29tbWVudC5lbmRJbmRleCxcbiAgICAgICAgc3RhcnRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxuICAgICAgICBvbGRFbmRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxuICAgICAgICBuZXdFbmRQb3NpdGlvbjogeyByb3c6IDAsIGNvbHVtbjogMCB9LFxuICAgICAgfSk7XG4gICAgICB0cmVlID0gdGhpcy5wYXJzZXIucGFyc2UoJycsIHRyZWUpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZmlsZTogdGhpcy5maWxlLFxuICAgICAgY29tbWVudHM6IENvbW1lbnRQYXJzZXIucGFyc2UodHJlZS5yb290Tm9kZSwgdGhpcy5maWxlLnRleHQpXG4gICAgICAgIC5maWx0ZXIodGhpcy5maWx0ZXJUeXBlKVxuICAgICAgICAvLyAubWFwKHRoaXMuY2hlY2tUeXBlKVxuICAgICAgICAubWFwKHRoaXMucGFyc2VDaGlsZHJlbilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbHRlclR5cGUgPSAoY29tbWVudDogSUNvbW1lbnQpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gKHRoaXMub3B0aW9ucy5maWx0ZXIgfHxcbiAgICAgIFtcbiAgICAgICAgJ2Z1bmN0aW9uJyxcbiAgICAgICAgJ2NsYXNzJyxcbiAgICAgICAgJ3ZhcmlhYmxlX2RlY2xhcmF0aW9uJ1xuICAgICAgXSkuaW5jbHVkZXMoY29tbWVudC5jb250ZXh0LnR5cGUpXG4gIH1cblxuICBwcml2YXRlIGNoZWNrVHlwZSA9IChjb21tZW50OiBJQ29tbWVudCk6IElDb21tZW50ID0+IHtcbiAgICBjb25zdCB0cmVlID0gdGhpcy5wYXJzZXIucGFyc2UoY29tbWVudC5jb250ZXh0LnRleHQpO1xuICAgIHN3aXRjaCAoY29tbWVudC5jb250ZXh0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ3ZhcmlhYmxlX2RlY2xhcmF0aW9uJzpcbiAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB3ZSBoYXZlIGFuIGFub255bW91cyBjbGFzc1xuICAgICAgICBpZiAoY29tbWVudC5jb250ZXh0LnRleHQuaW5jbHVkZXMoXCJjbGFzc1wiKSkge1xuICAgICAgICAgIC8vIERyaWxsIGRvd24gdW50aWwgd2UgZmluZCB0aGUgY2xhc3MgYm9keVxuICAgICAgICAgIGNvbnN0IHZhcmlhYmxlX2RlY2xhcmF0b3IgPSB0cmVlLnJvb3ROb2RlLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzFdO1xuICAgICAgICAgIGNvbnN0IGFub255bW91c19jbGFzcyA9IHZhcmlhYmxlX2RlY2xhcmF0b3IuY2hpbGRyZW5cbiAgICAgICAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiYW5vbnltb3VzX2NsYXNzXCIpWzBdXG4gICAgICAgICAgY29uc3QgY2xhc3NfYm9keSA9IGFub255bW91c19jbGFzcy5jaGlsZHJlblsxXTtcbiAgICAgICAgICBjb21tZW50LmNvbnRleHQuY2hpbGRyZW4gPSBDb21tZW50UGFyc2VyLnBhcnNlKFxuICAgICAgICAgICAgY2xhc3NfYm9keSxcbiAgICAgICAgICAgIGNvbW1lbnQuY29udGV4dC50ZXh0LFxuICAgICAgICAgICAgeyBsb2NhdGlvbjogY29tbWVudC5jb250ZXh0LmxvY2F0aW9uLCBwb3NpdGlvbjogY29tbWVudC5jb250ZXh0LnBvc2l0aW9uIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBjb21tZW50O1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZUNoaWxkcmVuID0gKGNvbW1lbnQ6IElDb21tZW50KTogSUNvbW1lbnQgPT4ge1xuICAgIHN3aXRjaCAoY29tbWVudC5jb250ZXh0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ2NsYXNzJzpcbiAgICAgICAgY29uc3QgdHJlZSA9IHRoaXMucGFyc2VyLnBhcnNlKGNvbW1lbnQuY29udGV4dC50ZXh0KTtcbiAgICAgICAgY29tbWVudC5jb250ZXh0LmNoaWxkcmVuID0gQ29tbWVudFBhcnNlci5wYXJzZShcbiAgICAgICAgICB0cmVlLnJvb3ROb2RlLFxuICAgICAgICAgIGNvbW1lbnQuY29udGV4dC50ZXh0LFxuICAgICAgICAgIHsgbG9jYXRpb246IGNvbW1lbnQuY29udGV4dC5sb2NhdGlvbiwgcG9zaXRpb246IGNvbW1lbnQuY29udGV4dC5wb3NpdGlvbiB9XG4gICAgICAgICkuZmlsdGVyKGNoaWxkID0+IGNoaWxkLmNvbnRleHQudHlwZSA9PT0gJ21ldGhvZF9kZWZpbml0aW9uJyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBjb21tZW50O1xuICB9XG59Il19