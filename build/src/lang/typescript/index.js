"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeSitter = require("tree-sitter");
const TypeScript = require("tree-sitter-typescript");
const parser_1 = require("../common/parser");
const walk_1 = require("../../utils/walk");
const visitor_1 = require("./visitor");
/**
 * A class that parses JavaScript comments.
 *
 * # API
 *
 * @class JavaScriptParser
 * @implements IParser
 * @export default
 */
class TypeScriptParser extends parser_1.default {
    constructor(source, options) {
        super(source, options);
        this.parse = () => {
            const visitor = new visitor_1.TypeScriptVisitor(this.source);
            const nodes = walk_1.default(this.tree_.rootNode);
            nodes.visit(visitor);
            return visitor.getAST();
        };
        this.parser = new TreeSitter();
        this.parser.setLanguage(TypeScript);
        this.tree_ = this.parser.parse(this.source.text);
    }
    get tree() {
        return this.tree_;
    }
}
exports.default = TypeScriptParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQTBDO0FBQzFDLHFEQUFxRDtBQUNyRCw2Q0FBc0M7QUFFdEMsMkNBQW9DO0FBQ3BDLHVDQUE4QztBQUk5Qzs7Ozs7Ozs7R0FRRztBQUNILE1BQXFCLGdCQUFpQixTQUFRLGdCQUFNO0lBR2xELFlBQVksTUFBYyxFQUFFLE9BQVk7UUFDdEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUt6QixVQUFLLEdBQUcsR0FBYyxFQUFFO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksMkJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25ELE1BQU0sS0FBSyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDcEIsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFBO1FBVEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBUUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQW5CRCxtQ0FtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBUcmVlU2l0dGVyIGZyb20gJ3RyZWUtc2l0dGVyJztcclxuaW1wb3J0ICogYXMgVHlwZVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci10eXBlc2NyaXB0JztcclxuaW1wb3J0IFBhcnNlciBmcm9tICcuLi9jb21tb24vcGFyc2VyJztcclxuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XHJcbmltcG9ydCB3YWxrIGZyb20gJy4uLy4uL3V0aWxzL3dhbGsnO1xyXG5pbXBvcnQgeyBUeXBlU2NyaXB0VmlzaXRvciB9IGZyb20gJy4vdmlzaXRvcic7XHJcbmltcG9ydCBBU1ROb2RlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvQVNUTm9kZSc7XHJcblxyXG5cclxuLyoqXHJcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cclxuICpcclxuICogIyBBUElcclxuICpcclxuICogQGNsYXNzIEphdmFTY3JpcHRQYXJzZXJcclxuICogQGltcGxlbWVudHMgSVBhcnNlclxyXG4gKiBAZXhwb3J0IGRlZmF1bHRcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGVTY3JpcHRQYXJzZXIgZXh0ZW5kcyBQYXJzZXIge1xyXG4gIHByaXZhdGUgcGFyc2VyOiBUcmVlU2l0dGVyO1xyXG4gIHByaXZhdGUgdHJlZV86IFRyZWVTaXR0ZXIuVHJlZTtcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSwgb3B0aW9uczogYW55KSB7XHJcbiAgICBzdXBlcihzb3VyY2UsIG9wdGlvbnMpO1xyXG4gICAgdGhpcy5wYXJzZXIgPSBuZXcgVHJlZVNpdHRlcigpO1xyXG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoVHlwZVNjcmlwdCk7XHJcbiAgICB0aGlzLnRyZWVfID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5zb3VyY2UudGV4dCk7XHJcbiAgfVxyXG4gIHBhcnNlID0gKCk6IEFTVE5vZGVbXSA9PiB7XHJcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IFR5cGVTY3JpcHRWaXNpdG9yKHRoaXMuc291cmNlKTtcclxuICAgIGNvbnN0IG5vZGVzID0gd2Fsayh0aGlzLnRyZWVfLnJvb3ROb2RlKTtcclxuICAgIG5vZGVzLnZpc2l0KHZpc2l0b3IpXHJcbiAgICByZXR1cm4gdmlzaXRvci5nZXRBU1QoKTtcclxuICB9XHJcblxyXG4gIGdldCB0cmVlICgpOiBUcmVlU2l0dGVyLlRyZWUge1xyXG4gICAgcmV0dXJuIHRoaXMudHJlZV87XHJcbiAgfVxyXG59XHJcbiJdfQ==