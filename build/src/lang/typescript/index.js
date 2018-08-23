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
    constructor(source, options) {
        this.parse = () => {
            const visitor = new visitor_1.TypeScriptVisitor(this.source);
            const root = walk_1.default(this.tree.rootNode);
            // console.time('visit')
            root.visit(visitor);
            // console.timeEnd('visit')
            return visitor.getAST();
        };
        this.source = source;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(TypeScript);
        this.tree_ = this.parser.parse(this.source.text);
    }
    get tree() {
        return this.tree;
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCwyQ0FBb0M7QUFDcEMsdUNBQThDO0FBSTlDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFLbkMsWUFBWSxNQUFjLEVBQUUsT0FBWTtRQU94QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsTUFBTSxJQUFJLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDbkIsMkJBQTJCO1lBQzNCLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQTtRQWJDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQVVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0NBQ0Y7QUF4QkQsbUNBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcclxuaW1wb3J0ICogYXMgVHlwZVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci10eXBlc2NyaXB0JztcclxuaW1wb3J0IFBhcnNlckludGVyZmFjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1BhcnNlckludGVyZmFjZSc7XHJcbmltcG9ydCBTb3VyY2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2UnO1xyXG5pbXBvcnQgd2FsayBmcm9tICcuLi8uLi91dGlscy93YWxrJztcclxuaW1wb3J0IHsgVHlwZVNjcmlwdFZpc2l0b3IgfSBmcm9tICcuL3Zpc2l0b3InO1xyXG5pbXBvcnQgbG9nIGZyb20gJy4uLy4uL3V0aWxzL2xvZyc7XHJcblxyXG5cclxuLyoqXHJcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cclxuICogXHJcbiAqICMgQVBJXHJcbiAqIFxyXG4gKiBgYGBcclxuICogQGNsYXNzIEphdmFTY3JpcHRQYXJzZXJcclxuICogQGltcGxlbWVudHMgSVBhcnNlclxyXG4gKiBAZXhwb3J0IGRlZmF1bHRcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlU2NyaXB0UGFyc2VyIGltcGxlbWVudHMgUGFyc2VySW50ZXJmYWNlIHtcclxuICBwcml2YXRlIHNvdXJjZTogU291cmNlO1xyXG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xyXG4gIHByaXZhdGUgcGFyc2VyOiBQYXJzZXI7XHJcbiAgcHJpdmF0ZSB0cmVlXzogUGFyc2VyLlRyZWU7XHJcbiAgY29uc3RydWN0b3Ioc291cmNlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSkge1xyXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcclxuICAgIHRoaXMucGFyc2VyID0gbmV3IFBhcnNlcigpO1xyXG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoVHlwZVNjcmlwdCk7XHJcbiAgICB0aGlzLnRyZWVfID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5zb3VyY2UudGV4dCk7XHJcbiAgfVxyXG4gIHBhcnNlID0gKCkgPT4ge1xyXG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBUeXBlU2NyaXB0VmlzaXRvcih0aGlzLnNvdXJjZSk7XHJcbiAgICBjb25zdCByb290ID0gd2Fsayh0aGlzLnRyZWUucm9vdE5vZGUpO1xyXG4gICAgLy8gY29uc29sZS50aW1lKCd2aXNpdCcpXHJcbiAgICByb290LnZpc2l0KHZpc2l0b3IpXHJcbiAgICAvLyBjb25zb2xlLnRpbWVFbmQoJ3Zpc2l0JylcclxuICAgIHJldHVybiB2aXNpdG9yLmdldEFTVCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IHRyZWUgKCk6IFBhcnNlci5UcmVlIHtcclxuICAgIHJldHVybiB0aGlzLnRyZWU7XHJcbiAgfVxyXG59XHJcbiJdfQ==