"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const TypeScript = require("tree-sitter-typescript");
const walk_1 = require("./walk");
const visitor_1 = require("./visitors/visitor");
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
            const tree = this.parser.parse(this.source.text);
            if (tree.rootNode.type === "program") {
                const visitor = new visitor_1.TypeScriptVisitor(this.source);
                walk_1.default(tree.rootNode).visit(visitor);
                return visitor.getAST();
            }
        };
        this.source = file;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(TypeScript);
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCxpQ0FBMEI7QUFDMUIsZ0RBQXVEO0FBR3ZEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFJbkMsWUFBWSxJQUFZLEVBQUUsT0FBWTtRQU10QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25ELGNBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN6QjtRQUNILENBQUMsQ0FBQTtRQVpDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBU0Y7QUFsQkQsbUNBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCAqIGFzIFR5cGVTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItdHlwZXNjcmlwdCc7XG5pbXBvcnQgSVBhcnNlciBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lQYXJzZXInO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgd2FsayBmcm9tICcuL3dhbGsnO1xuaW1wb3J0IHsgVHlwZVNjcmlwdFZpc2l0b3IgfSBmcm9tICcuL3Zpc2l0b3JzL3Zpc2l0b3InO1xuXG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBKYXZhU2NyaXB0IGNvbW1lbnRzLlxuICogXG4gKiAjIEFQSVxuICogXG4gKiBgYGBcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBAZXhwb3J0IGRlZmF1bHRcbiAqIGBgYFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlU2NyaXB0UGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XG4gIHByaXZhdGUgc291cmNlOiBTb3VyY2U7XG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xuICBwcml2YXRlIHBhcnNlcjogUGFyc2VyO1xuICBjb25zdHJ1Y3RvcihmaWxlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuc291cmNlID0gZmlsZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIoKTtcbiAgICB0aGlzLnBhcnNlci5zZXRMYW5ndWFnZShUeXBlU2NyaXB0KTtcbiAgfVxuICBwYXJzZSA9ICgpID0+IHtcbiAgICBjb25zdCB0cmVlID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5zb3VyY2UudGV4dCk7XG4gICAgaWYgKHRyZWUucm9vdE5vZGUudHlwZSA9PT0gXCJwcm9ncmFtXCIpIHtcbiAgICAgIGNvbnN0IHZpc2l0b3IgPSBuZXcgVHlwZVNjcmlwdFZpc2l0b3IodGhpcy5zb3VyY2UpO1xuICAgICAgd2Fsayh0cmVlLnJvb3ROb2RlKS52aXNpdCh2aXNpdG9yKTtcbiAgICAgIHJldHVybiB2aXNpdG9yLmdldEFTVCgpO1xuICAgIH1cbiAgfVxufVxuIl19