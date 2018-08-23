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
            const visitor = new visitor_1.TypeScriptVisitor(this.source);
            const root = walk_1.default(tree.rootNode);
            console.time('visit');
            root.visit(visitor);
            console.timeEnd('visit');
            return visitor.getAST();
        };
        this.source = file;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(TypeScript);
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCwyQ0FBb0M7QUFDcEMsdUNBQThDO0FBSTlDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFJbkMsWUFBWSxJQUFZLEVBQUUsT0FBWTtRQU10QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLDJCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBRXhCLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQTtRQWRDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBV0Y7QUFwQkQsbUNBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCAqIGFzIFR5cGVTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItdHlwZXNjcmlwdCc7XG5pbXBvcnQgSVBhcnNlciBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL0lQYXJzZXInO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgd2FsayBmcm9tICcuLi8uLi91dGlscy93YWxrJztcbmltcG9ydCB7IFR5cGVTY3JpcHRWaXNpdG9yIH0gZnJvbSAnLi92aXNpdG9yJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vLi4vdXRpbHMvbG9nJztcblxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cbiAqIFxuICogIyBBUElcbiAqIFxuICogYGBgXG4gKiBAY2xhc3MgSmF2YVNjcmlwdFBhcnNlclxuICogQGltcGxlbWVudHMgSVBhcnNlclxuICogQGV4cG9ydCBkZWZhdWx0XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwZVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIElQYXJzZXIge1xuICBwcml2YXRlIHNvdXJjZTogU291cmNlO1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLnNvdXJjZSA9IGZpbGU7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLm9wdGlvbnMgPSB7fSwgb3B0aW9ucyB8fCB7fSk7XG4gICAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKCk7XG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoVHlwZVNjcmlwdCk7XG4gIH1cbiAgcGFyc2UgPSAoKSA9PiB7XG4gICAgY29uc3QgdHJlZSA9IHRoaXMucGFyc2VyLnBhcnNlKHRoaXMuc291cmNlLnRleHQpO1xuICAgIGNvbnN0IHZpc2l0b3IgPSBuZXcgVHlwZVNjcmlwdFZpc2l0b3IodGhpcy5zb3VyY2UpO1xuICAgIGNvbnN0IHJvb3QgPSB3YWxrKHRyZWUucm9vdE5vZGUpO1xuICAgIGNvbnNvbGUudGltZSgndmlzaXQnKVxuICAgIHJvb3QudmlzaXQodmlzaXRvcilcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3Zpc2l0JylcblxuICAgIHJldHVybiB2aXNpdG9yLmdldEFTVCgpO1xuICB9XG59XG4iXX0=