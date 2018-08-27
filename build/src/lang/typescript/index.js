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
            const visitor = new visitor_1.TypeScriptVisitor(this.source, this.options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMENBQTBDO0FBQzFDLHFEQUFxRDtBQUNyRCw2Q0FBc0M7QUFFdEMsMkNBQW9DO0FBQ3BDLHVDQUE4QztBQUk5Qzs7Ozs7Ozs7R0FRRztBQUNILE1BQXFCLGdCQUFpQixTQUFRLGdCQUFNO0lBR2xELFlBQVksTUFBYyxFQUFFLE9BQVk7UUFDdEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUt6QixVQUFLLEdBQUcsR0FBYyxFQUFFO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksMkJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsTUFBTSxLQUFLLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNwQixPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixDQUFDLENBQUE7UUFUQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFRRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBbkJELG1DQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRyZWVTaXR0ZXIgZnJvbSAndHJlZS1zaXR0ZXInO1xuaW1wb3J0ICogYXMgVHlwZVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci10eXBlc2NyaXB0JztcbmltcG9ydCBQYXJzZXIgZnJvbSAnLi4vY29tbW9uL3BhcnNlcic7XG5pbXBvcnQgU291cmNlIGZyb20gJy4uLy4uL2ludGVyZmFjZXMvU291cmNlJztcbmltcG9ydCB3YWxrIGZyb20gJy4uLy4uL3V0aWxzL3dhbGsnO1xuaW1wb3J0IHsgVHlwZVNjcmlwdFZpc2l0b3IgfSBmcm9tICcuL3Zpc2l0b3InO1xuaW1wb3J0IEFTVE5vZGUgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9BU1ROb2RlJztcblxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cbiAqXG4gKiAjIEFQSVxuICpcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBAZXhwb3J0IGRlZmF1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwZVNjcmlwdFBhcnNlciBleHRlbmRzIFBhcnNlciB7XG4gIHByaXZhdGUgcGFyc2VyOiBUcmVlU2l0dGVyO1xuICBwcml2YXRlIHRyZWVfOiBUcmVlU2l0dGVyLlRyZWU7XG4gIGNvbnN0cnVjdG9yKHNvdXJjZTogU291cmNlLCBvcHRpb25zOiBhbnkpIHtcbiAgICBzdXBlcihzb3VyY2UsIG9wdGlvbnMpO1xuICAgIHRoaXMucGFyc2VyID0gbmV3IFRyZWVTaXR0ZXIoKTtcbiAgICB0aGlzLnBhcnNlci5zZXRMYW5ndWFnZShUeXBlU2NyaXB0KTtcbiAgICB0aGlzLnRyZWVfID0gdGhpcy5wYXJzZXIucGFyc2UodGhpcy5zb3VyY2UudGV4dCk7XG4gIH1cbiAgcGFyc2UgPSAoKTogQVNUTm9kZVtdID0+IHtcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IFR5cGVTY3JpcHRWaXNpdG9yKHRoaXMuc291cmNlLCB0aGlzLm9wdGlvbnMpO1xuICAgIGNvbnN0IG5vZGVzID0gd2Fsayh0aGlzLnRyZWVfLnJvb3ROb2RlKTtcbiAgICBub2Rlcy52aXNpdCh2aXNpdG9yKVxuICAgIHJldHVybiB2aXNpdG9yLmdldEFTVCgpO1xuICB9XG5cbiAgZ2V0IHRyZWUgKCk6IFRyZWVTaXR0ZXIuVHJlZSB7XG4gICAgcmV0dXJuIHRoaXMudHJlZV87XG4gIH1cbn1cbiJdfQ==