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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQTBDO0FBQzFDLHFEQUFxRDtBQUNyRCw2Q0FBc0M7QUFFdEMsMkNBQW9DO0FBQ3BDLHVDQUE4QztBQUk5Qzs7Ozs7Ozs7R0FRRztBQUNILE1BQXFCLGdCQUFpQixTQUFRLGdCQUFNO0lBR2xELFlBQVksTUFBYyxFQUFFLE9BQVk7UUFDdEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUt6QixVQUFLLEdBQUcsR0FBYyxFQUFFO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksMkJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25ELE1BQU0sS0FBSyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDcEIsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFBO1FBVEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBUUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQW5CRCxtQ0FtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBUcmVlU2l0dGVyIGZyb20gJ3RyZWUtc2l0dGVyJztcbmltcG9ydCAqIGFzIFR5cGVTY3JpcHQgZnJvbSAndHJlZS1zaXR0ZXItdHlwZXNjcmlwdCc7XG5pbXBvcnQgUGFyc2VyIGZyb20gJy4uL2NvbW1vbi9wYXJzZXInO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgd2FsayBmcm9tICcuLi8uLi91dGlscy93YWxrJztcbmltcG9ydCB7IFR5cGVTY3JpcHRWaXNpdG9yIH0gZnJvbSAnLi92aXNpdG9yJztcbmltcG9ydCBBU1ROb2RlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvQVNUTm9kZSc7XG5cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIEphdmFTY3JpcHQgY29tbWVudHMuXG4gKlxuICogIyBBUElcbiAqXG4gKiBAY2xhc3MgSmF2YVNjcmlwdFBhcnNlclxuICogQGltcGxlbWVudHMgSVBhcnNlclxuICogQGV4cG9ydCBkZWZhdWx0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGVTY3JpcHRQYXJzZXIgZXh0ZW5kcyBQYXJzZXIge1xuICBwcml2YXRlIHBhcnNlcjogVHJlZVNpdHRlcjtcbiAgcHJpdmF0ZSB0cmVlXzogVHJlZVNpdHRlci5UcmVlO1xuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSwgb3B0aW9uczogYW55KSB7XG4gICAgc3VwZXIoc291cmNlLCBvcHRpb25zKTtcbiAgICB0aGlzLnBhcnNlciA9IG5ldyBUcmVlU2l0dGVyKCk7XG4gICAgdGhpcy5wYXJzZXIuc2V0TGFuZ3VhZ2UoVHlwZVNjcmlwdCk7XG4gICAgdGhpcy50cmVlXyA9IHRoaXMucGFyc2VyLnBhcnNlKHRoaXMuc291cmNlLnRleHQpO1xuICB9XG4gIHBhcnNlID0gKCk6IEFTVE5vZGVbXSA9PiB7XG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBUeXBlU2NyaXB0VmlzaXRvcih0aGlzLnNvdXJjZSk7XG4gICAgY29uc3Qgbm9kZXMgPSB3YWxrKHRoaXMudHJlZV8ucm9vdE5vZGUpO1xuICAgIG5vZGVzLnZpc2l0KHZpc2l0b3IpXG4gICAgcmV0dXJuIHZpc2l0b3IuZ2V0QVNUKCk7XG4gIH1cblxuICBnZXQgdHJlZSAoKTogVHJlZVNpdHRlci5UcmVlIHtcbiAgICByZXR1cm4gdGhpcy50cmVlXztcbiAgfVxufVxuIl19