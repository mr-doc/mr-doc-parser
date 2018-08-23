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
            const root = walk_1.default(this.tree_.rootNode);
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
        return this.tree_;
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCwyQ0FBb0M7QUFDcEMsdUNBQThDO0FBRzlDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFLbkMsWUFBWSxNQUFjLEVBQUUsT0FBWTtRQU94QyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsTUFBTSxJQUFJLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkMsd0JBQXdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDbkIsMkJBQTJCO1lBQzNCLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQTtRQWJDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQVVELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUF4QkQsbUNBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUGFyc2VyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCAqIGFzIFR5cGVTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItdHlwZXNjcmlwdCc7XG5pbXBvcnQgUGFyc2VySW50ZXJmYWNlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvUGFyc2VySW50ZXJmYWNlJztcbmltcG9ydCBTb3VyY2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9Tb3VyY2UnO1xuaW1wb3J0IHdhbGsgZnJvbSAnLi4vLi4vdXRpbHMvd2Fsayc7XG5pbXBvcnQgeyBUeXBlU2NyaXB0VmlzaXRvciB9IGZyb20gJy4vdmlzaXRvcic7XG5cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIEphdmFTY3JpcHQgY29tbWVudHMuXG4gKiBcbiAqICMgQVBJXG4gKiBcbiAqIGBgYFxuICogQGNsYXNzIEphdmFTY3JpcHRQYXJzZXJcbiAqIEBpbXBsZW1lbnRzIElQYXJzZXJcbiAqIEBleHBvcnQgZGVmYXVsdFxuICogYGBgXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGVTY3JpcHRQYXJzZXIgaW1wbGVtZW50cyBQYXJzZXJJbnRlcmZhY2Uge1xuICBwcml2YXRlIHNvdXJjZTogU291cmNlO1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcbiAgcHJpdmF0ZSB0cmVlXzogUGFyc2VyLlRyZWU7XG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlLCBvcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIoKTtcbiAgICB0aGlzLnBhcnNlci5zZXRMYW5ndWFnZShUeXBlU2NyaXB0KTtcbiAgICB0aGlzLnRyZWVfID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5zb3VyY2UudGV4dCk7XG4gIH1cbiAgcGFyc2UgPSAoKSA9PiB7XG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBUeXBlU2NyaXB0VmlzaXRvcih0aGlzLnNvdXJjZSk7XG4gICAgY29uc3Qgcm9vdCA9IHdhbGsodGhpcy50cmVlXy5yb290Tm9kZSk7XG4gICAgLy8gY29uc29sZS50aW1lKCd2aXNpdCcpXG4gICAgcm9vdC52aXNpdCh2aXNpdG9yKVxuICAgIC8vIGNvbnNvbGUudGltZUVuZCgndmlzaXQnKVxuICAgIHJldHVybiB2aXNpdG9yLmdldEFTVCgpO1xuICB9XG5cbiAgZ2V0IHRyZWUgKCk6IFBhcnNlci5UcmVlIHtcbiAgICByZXR1cm4gdGhpcy50cmVlXztcbiAgfVxufVxuIl19