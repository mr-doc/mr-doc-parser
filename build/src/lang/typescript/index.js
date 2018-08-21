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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCxnRUFBMEQ7QUFHMUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQXFCLGdCQUFnQjtJQUluQyxZQUFZLElBQVksRUFBRSxPQUFZO1FBTXRDLFVBQUssR0FBRyxHQUFHLEVBQUU7WUFDWCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxPQUFPLDhCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDOUM7UUFDSCxDQUFDLENBQUE7UUFWQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztDQU9GO0FBaEJELG1DQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFBhcnNlciBmcm9tICd0cmVlLXNpdHRlcic7XG5pbXBvcnQgKiBhcyBUeXBlU2NyaXB0IGZyb20gJ3RyZWUtc2l0dGVyLXR5cGVzY3JpcHQnO1xuaW1wb3J0IElQYXJzZXIgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JUGFyc2VyJztcbmltcG9ydCBTb3VyY2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2UnO1xuaW1wb3J0IHsgdmlzaXRQcm9ncmFtIH0gZnJvbSAnLi92aXNpdG9ycy9wcm9ncmFtLnZpc2l0b3InO1xuXG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBKYXZhU2NyaXB0IGNvbW1lbnRzLlxuICogXG4gKiAjIEFQSVxuICogXG4gKiBgYGBcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBAZXhwb3J0IGRlZmF1bHRcbiAqIGBgYFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlU2NyaXB0UGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XG4gIHByaXZhdGUgZmlsZTogU291cmNlO1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLmZpbGUgPSBmaWxlO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zID0ge30sIG9wdGlvbnMgfHwge30pO1xuICAgIHRoaXMucGFyc2VyID0gbmV3IFBhcnNlcigpO1xuICAgIHRoaXMucGFyc2VyLnNldExhbmd1YWdlKFR5cGVTY3JpcHQpO1xuICB9XG4gIHBhcnNlID0gKCkgPT4ge1xuICAgIGNvbnN0IHRyZWUgPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLmZpbGUudGV4dCk7XG4gICAgaWYgKHRyZWUucm9vdE5vZGUudHlwZSA9PT0gXCJwcm9ncmFtXCIpIHtcbiAgICAgIHJldHVybiB2aXNpdFByb2dyYW0odGhpcy5maWxlLCB0cmVlLnJvb3ROb2RlKVxuICAgIH1cbiAgfVxufVxuIl19