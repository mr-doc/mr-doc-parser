"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");
const visitor_1 = require("./visitor");
const walk_1 = require("../../utils/walk");
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
    constructor(source, options) {
        this.source = source;
        Object.assign(this.options = {}, options || {});
        this.parser = new Parser();
        this.parser.setLanguage(JavaScript);
        this.tree_ = this.parser.parse(this.source.text);
    }
    parse() {
        const visitor = new visitor_1.JavaScriptVisitor(this.source);
        const root = walk_1.default(this.tree_.rootNode);
        // console.time('visit')
        root.visit(visitor);
        // console.timeEnd('visit')
        return visitor.getAST();
    }
    get tree() {
        return this.tree_;
    }
}
exports.default = JavaScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy9qYXZhc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUlyRCx1Q0FBOEM7QUFDOUMsMkNBQW9DO0FBRXBDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFxQixnQkFBZ0I7SUFNbkMsWUFBWSxNQUFjLEVBQUUsT0FBWTtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFDRCxLQUFLO1FBQ0gsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsTUFBTSxJQUFJLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbkIsMkJBQTJCO1FBQzNCLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFDRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBeEJELG1DQXdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFBhcnNlciBmcm9tICd0cmVlLXNpdHRlcic7XG5pbXBvcnQgKiBhcyBKYXZhU2NyaXB0IGZyb20gJ3RyZWUtc2l0dGVyLWphdmFzY3JpcHQnO1xuaW1wb3J0IFBhcnNlckludGVyZmFjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1BhcnNlckludGVyZmFjZSc7XG5pbXBvcnQgU291cmNlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvU291cmNlJztcbmltcG9ydCB7IEFTVE5vZGUgfSBmcm9tICcuLi9jb21tb24vYXN0JztcbmltcG9ydCB7IEphdmFTY3JpcHRWaXNpdG9yIH0gZnJvbSAnLi92aXNpdG9yJztcbmltcG9ydCB3YWxrIGZyb20gJy4uLy4uL3V0aWxzL3dhbGsnO1xuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cbiAqIFxuICogIyBBUElcbiAqIFxuICogYGBgXG4gKiBAY2xhc3MgSmF2YVNjcmlwdFBhcnNlclxuICogQGltcGxlbWVudHMgSVBhcnNlclxuICogQGV4cG9ydCBkZWZhdWx0XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSmF2YVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIFBhcnNlckludGVyZmFjZSB7XG4gIFxuICBwcml2YXRlIHNvdXJjZTogU291cmNlO1xuICBwcml2YXRlIG9wdGlvbnM6IGFueTtcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcbiAgcHJpdmF0ZSB0cmVlXzogUGFyc2VyLlRyZWU7XG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlLCBvcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucyA9IHt9LCBvcHRpb25zIHx8IHt9KTtcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBQYXJzZXIoKTtcbiAgICB0aGlzLnBhcnNlci5zZXRMYW5ndWFnZShKYXZhU2NyaXB0KTtcbiAgICB0aGlzLnRyZWVfID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5zb3VyY2UudGV4dCk7XG4gIH1cbiAgcGFyc2UoKTogQVNUTm9kZVtdIHtcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IEphdmFTY3JpcHRWaXNpdG9yKHRoaXMuc291cmNlKTtcbiAgICBjb25zdCByb290ID0gd2Fsayh0aGlzLnRyZWVfLnJvb3ROb2RlKTtcbiAgICAvLyBjb25zb2xlLnRpbWUoJ3Zpc2l0JylcbiAgICByb290LnZpc2l0KHZpc2l0b3IpXG4gICAgLy8gY29uc29sZS50aW1lRW5kKCd2aXNpdCcpXG4gICAgcmV0dXJuIHZpc2l0b3IuZ2V0QVNUKCk7XG4gIH1cbiAgZ2V0IHRyZWUgKCk6IFBhcnNlci5UcmVlIHtcbiAgICByZXR1cm4gdGhpcy50cmVlXztcbiAgfVxufSJdfQ==