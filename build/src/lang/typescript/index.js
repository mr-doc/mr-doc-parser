"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const TypeScript = require("tree-sitter-typescript");
const walk_1 = require("../../utils/walk");
const visitor_1 = require("./visitor");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCwyQ0FBb0M7QUFDcEMsdUNBQThDO0FBRzlDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFJbkMsWUFBWSxJQUFZLEVBQUUsT0FBWTtRQU10QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25ELGNBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN6QjtRQUNILENBQUMsQ0FBQTtRQVpDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBU0Y7QUFsQkQsbUNBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcclxuaW1wb3J0ICogYXMgVHlwZVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci10eXBlc2NyaXB0JztcclxuaW1wb3J0IElQYXJzZXIgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9JUGFyc2VyJztcclxuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XHJcbmltcG9ydCB3YWxrIGZyb20gJy4uLy4uL3V0aWxzL3dhbGsnO1xyXG5pbXBvcnQgeyBUeXBlU2NyaXB0VmlzaXRvciB9IGZyb20gJy4vdmlzaXRvcic7XHJcblxyXG5cclxuLyoqXHJcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cclxuICogXHJcbiAqICMgQVBJXHJcbiAqIFxyXG4gKiBgYGBcclxuICogQGNsYXNzIEphdmFTY3JpcHRQYXJzZXJcclxuICogQGltcGxlbWVudHMgSVBhcnNlclxyXG4gKiBAZXhwb3J0IGRlZmF1bHRcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlU2NyaXB0UGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XHJcbiAgcHJpdmF0ZSBzb3VyY2U6IFNvdXJjZTtcclxuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcclxuICBwcml2YXRlIHBhcnNlcjogUGFyc2VyO1xyXG4gIGNvbnN0cnVjdG9yKGZpbGU6IFNvdXJjZSwgb3B0aW9uczogYW55KSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IGZpbGU7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcclxuICAgIHRoaXMucGFyc2VyID0gbmV3IFBhcnNlcigpO1xyXG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoVHlwZVNjcmlwdCk7XHJcbiAgfVxyXG4gIHBhcnNlID0gKCkgPT4ge1xyXG4gICAgY29uc3QgdHJlZSA9IHRoaXMucGFyc2VyLnBhcnNlKHRoaXMuc291cmNlLnRleHQpO1xyXG4gICAgaWYgKHRyZWUucm9vdE5vZGUudHlwZSA9PT0gXCJwcm9ncmFtXCIpIHtcclxuICAgICAgY29uc3QgdmlzaXRvciA9IG5ldyBUeXBlU2NyaXB0VmlzaXRvcih0aGlzLnNvdXJjZSk7XHJcbiAgICAgIHdhbGsodHJlZS5yb290Tm9kZSkudmlzaXQodmlzaXRvcik7XHJcbiAgICAgIHJldHVybiB2aXNpdG9yLmdldEFTVCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=