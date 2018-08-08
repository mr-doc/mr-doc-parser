"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const TypeScript = require("tree-sitter-javascript");
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
class TypeScriptParser {
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
        this.parser.setLanguage(TypeScript);
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUlyRCx1REFBZ0Q7QUFHaEQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQXFCLGdCQUFnQjtJQUluQyxZQUFZLElBQVcsRUFBRSxPQUFZO1FBTXJDLFVBQUssR0FBRyxHQUFZLEVBQUU7WUFDcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3Qyx3QkFBd0I7WUFDeEIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRO2lCQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO2lCQUMxQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFN0QsMENBQTBDO1lBQzFDLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnQkFDNUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztnQkFDdkMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7Z0JBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ1IsVUFBVSxFQUFFLGFBQWEsQ0FBQyxVQUFVO29CQUNwQyxXQUFXLEVBQUUsYUFBYSxDQUFDLFFBQVE7b0JBQ25DLFdBQVcsRUFBRSxhQUFhLENBQUMsUUFBUTtvQkFDbkMsYUFBYSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFO29CQUNwQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUU7b0JBQ3JDLGNBQWMsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtpQkFDdEMsQ0FBQyxDQUFDO2dCQUNILElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPO2dCQUNMLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDZixRQUFRLEVBQUUsdUJBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztxQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7cUJBQ3ZCLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQzNCLENBQUE7UUFDSCxDQUFDLENBQUE7UUFFTyxlQUFVLEdBQUcsQ0FBQyxPQUFpQixFQUFXLEVBQUU7WUFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtnQkFDekI7b0JBQ0UsVUFBVTtvQkFDVixPQUFPO29CQUNQLHNCQUFzQjtpQkFDdkIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3JDLENBQUMsQ0FBQTtRQUVPLGtCQUFhLEdBQUcsQ0FBQyxPQUFpQixFQUFZLEVBQUU7WUFDdEQsUUFBUSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDNUIsS0FBSyxPQUFPO29CQUNWLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JELE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLHVCQUFhLENBQUMsS0FBSyxDQUM1QyxJQUFJLENBQUMsUUFBUSxFQUNiLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUNwQixFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FDM0UsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxDQUFDO29CQUM5RCxNQUFNO2dCQUNSO29CQUNFLE1BQU07YUFDVDtZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUMsQ0FBQTtRQTFEQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztDQXVERjtBQWhFRCxtQ0FnRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBQYXJzZXIgZnJvbSAndHJlZS1zaXR0ZXInO1xuaW1wb3J0ICogYXMgVHlwZVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci1qYXZhc2NyaXB0JztcbmltcG9ydCBJUGFyc2VyIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSVBhcnNlcic7XG5pbXBvcnQgSUZpbGUgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JRmlsZSc7XG5pbXBvcnQgSVJlc3VsdCBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lSZXN1bHQnO1xuaW1wb3J0IENvbW1lbnRQYXJzZXIgZnJvbSAnLi4vLi4vQ29tbWVudFBhcnNlcic7XG5pbXBvcnQgSUNvbW1lbnQgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JQ29tbWVudCc7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBKYXZhU2NyaXB0IGNvbW1lbnRzLlxuICogXG4gKiAjIEFQSVxuICogXG4gKiBgYGBcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBAZXhwb3J0IGRlZmF1bHRcbiAqIGBgYFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlU2NyaXB0UGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XG4gIHByaXZhdGUgZmlsZTogSUZpbGU7XG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xuICBwcml2YXRlIHBhcnNlcjogUGFyc2VyO1xuICBjb25zdHJ1Y3RvcihmaWxlOiBJRmlsZSwgb3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5maWxlID0gZmlsZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIoKTtcbiAgICB0aGlzLnBhcnNlci5zZXRMYW5ndWFnZShUeXBlU2NyaXB0KTtcbiAgfVxuICBwYXJzZSA9ICgpOiBJUmVzdWx0ID0+IHtcbiAgICBsZXQgdHJlZSA9IHRoaXMucGFyc2VyLnBhcnNlKHRoaXMuZmlsZS50ZXh0KTtcbiAgICAvLyBHZXQgdGhlIGZpcnN0IGNvbW1lbnRcbiAgICBsZXQgZmlyc3RfY29tbWVudCA9IHRyZWUucm9vdE5vZGUuY2hpbGRyZW5cbiAgICAgIC5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiY29tbWVudFwiKVswXTtcbiAgICBjb25zdCBmaXJzdF9jb21tZW50X3N0cmluZyA9IHRoaXMuZmlsZS50ZXh0XG4gICAgLnN1YnN0cmluZyhmaXJzdF9jb21tZW50LnN0YXJ0SW5kZXgsIGZpcnN0X2NvbW1lbnQuZW5kSW5kZXgpO1xuICAgIFxuICAgIC8vIFJlbW92ZSBhbnkgbGVnYWwgb3IgdW5uY2Vzc2FyeSBjb21tZW50c1xuICAgIGlmIChmaXJzdF9jb21tZW50X3N0cmluZy5pbmNsdWRlcyhcImNvcHlyaWdodFwiKSB8fFxuICAgICAgZmlyc3RfY29tbWVudF9zdHJpbmcuaW5jbHVkZXMoXCJhdXRob3JcIikgfHxcbiAgICAgIGZpcnN0X2NvbW1lbnRfc3RyaW5nLmluY2x1ZGVzKFwidGVybXMgYW5kIGNvbmRpdGlvbnNcIikpIHtcbiAgICAgIHRyZWUuZWRpdCh7XG4gICAgICAgIHN0YXJ0SW5kZXg6IGZpcnN0X2NvbW1lbnQuc3RhcnRJbmRleCxcbiAgICAgICAgb2xkRW5kSW5kZXg6IGZpcnN0X2NvbW1lbnQuZW5kSW5kZXgsXG4gICAgICAgIG5ld0VuZEluZGV4OiBmaXJzdF9jb21tZW50LmVuZEluZGV4LFxuICAgICAgICBzdGFydFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXG4gICAgICAgIG9sZEVuZFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXG4gICAgICAgIG5ld0VuZFBvc2l0aW9uOiB7IHJvdzogMCwgY29sdW1uOiAwIH0sXG4gICAgICB9KTtcbiAgICAgIHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSgnJywgdHJlZSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBmaWxlOiB0aGlzLmZpbGUsXG4gICAgICBjb21tZW50czogQ29tbWVudFBhcnNlci5wYXJzZSh0cmVlLnJvb3ROb2RlLCB0aGlzLmZpbGUudGV4dClcbiAgICAgICAgLmZpbHRlcih0aGlzLmZpbHRlclR5cGUpXG4gICAgICAgIC5tYXAodGhpcy5wYXJzZUNoaWxkcmVuKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmlsdGVyVHlwZSA9IChjb21tZW50OiBJQ29tbWVudCk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAodGhpcy5vcHRpb25zLmZpbHRlciB8fFxuICAgICAgW1xuICAgICAgICAnZnVuY3Rpb24nLFxuICAgICAgICAnY2xhc3MnLFxuICAgICAgICAndmFyaWFibGVfZGVjbGFyYXRpb24nXG4gICAgICBdKS5pbmNsdWRlcyhjb21tZW50LmNvbnRleHQudHlwZSlcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VDaGlsZHJlbiA9IChjb21tZW50OiBJQ29tbWVudCk6IElDb21tZW50ID0+IHtcbiAgICBzd2l0Y2ggKGNvbW1lbnQuY29udGV4dC50eXBlKSB7XG4gICAgICBjYXNlICdjbGFzcyc6XG4gICAgICAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZShjb21tZW50LmNvbnRleHQudGV4dCk7XG4gICAgICAgIGNvbW1lbnQuY29udGV4dC5jaGlsZHJlbiA9IENvbW1lbnRQYXJzZXIucGFyc2UoXG4gICAgICAgICAgdHJlZS5yb290Tm9kZSxcbiAgICAgICAgICBjb21tZW50LmNvbnRleHQudGV4dCxcbiAgICAgICAgICB7IGxvY2F0aW9uOiBjb21tZW50LmNvbnRleHQubG9jYXRpb24sIHBvc2l0aW9uOiBjb21tZW50LmNvbnRleHQucG9zaXRpb24gfVxuICAgICAgICApLmZpbHRlcihjaGlsZCA9PiBjaGlsZC5jb250ZXh0LnR5cGUgPT09ICdtZXRob2RfZGVmaW5pdGlvbicpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxufSJdfQ==