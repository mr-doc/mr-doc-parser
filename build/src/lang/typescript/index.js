"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const TypeScript = require("tree-sitter-typescript");
const program_visitor_1 = require("./visitors/program.visitor");
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
            const tree = this.parser.parse(this.file.text);
            if (tree.rootNode.type === "program") {
                return program_visitor_1.visitProgram(this.file, tree.rootNode);
            }
        };
        this.file = file;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(TypeScript);
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCxnRUFBMEQ7QUFHMUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQXFCLGdCQUFnQjtJQUluQyxZQUFZLElBQVcsRUFBRSxPQUFZO1FBTXJDLFVBQUssR0FBRyxHQUFHLEVBQUU7WUFDWCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxPQUFPLDhCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDOUM7UUFDSCxDQUFDLENBQUE7UUFWQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztDQU9GO0FBaEJELG1DQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFBhcnNlciBmcm9tICd0cmVlLXNpdHRlcic7XHJcbmltcG9ydCAqIGFzIFR5cGVTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItdHlwZXNjcmlwdCc7XHJcbmltcG9ydCBJUGFyc2VyIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvSVBhcnNlcic7XHJcbmltcG9ydCBJRmlsZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lGaWxlJztcclxuaW1wb3J0IHsgdmlzaXRQcm9ncmFtIH0gZnJvbSAnLi92aXNpdG9ycy9wcm9ncmFtLnZpc2l0b3InO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIEphdmFTY3JpcHQgY29tbWVudHMuXHJcbiAqIFxyXG4gKiAjIEFQSVxyXG4gKiBcclxuICogYGBgXHJcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXHJcbiAqIEBpbXBsZW1lbnRzIElQYXJzZXJcclxuICogQGV4cG9ydCBkZWZhdWx0XHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwZVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIElQYXJzZXIge1xyXG4gIHByaXZhdGUgZmlsZTogSUZpbGU7XHJcbiAgcHJpdmF0ZSBvcHRpb25zOiBhbnk7XHJcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcclxuICBjb25zdHJ1Y3RvcihmaWxlOiBJRmlsZSwgb3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xyXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMgPSB7fSwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIoKTtcclxuICAgIHRoaXMucGFyc2VyLnNldExhbmd1YWdlKFR5cGVTY3JpcHQpO1xyXG4gIH1cclxuICBwYXJzZSA9ICgpID0+IHtcclxuICAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLmZpbGUudGV4dCk7XHJcbiAgICBpZiAodHJlZS5yb290Tm9kZS50eXBlID09PSBcInByb2dyYW1cIikge1xyXG4gICAgICByZXR1cm4gdmlzaXRQcm9ncmFtKHRoaXMuZmlsZSwgdHJlZS5yb290Tm9kZSlcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19