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
 * @class JavaScriptParser
 * @implements IParser
 * @export default
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGFuZy90eXBlc2NyaXB0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQXNDO0FBQ3RDLHFEQUFxRDtBQUdyRCwyQ0FBb0M7QUFDcEMsdUNBQThDO0FBSTlDOzs7Ozs7OztHQVFHO0FBQ0gsTUFBcUIsZ0JBQWdCO0lBS25DLFlBQVksTUFBYyxFQUFFLE9BQVk7UUFPeEMsVUFBSyxHQUFHLEdBQWMsRUFBRTtZQUN0QixNQUFNLE9BQU8sR0FBRyxJQUFJLDJCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2Qyx3QkFBd0I7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNuQiwyQkFBMkI7WUFDM0IsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsQ0FBQyxDQUFBO1FBYkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBVUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7Q0FDRjtBQXhCRCxtQ0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBQYXJzZXIgZnJvbSAndHJlZS1zaXR0ZXInO1xuaW1wb3J0ICogYXMgVHlwZVNjcmlwdCBmcm9tICd0cmVlLXNpdHRlci10eXBlc2NyaXB0JztcbmltcG9ydCBQYXJzZXJJbnRlcmZhY2UgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9QYXJzZXJJbnRlcmZhY2UnO1xuaW1wb3J0IFNvdXJjZSBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgd2FsayBmcm9tICcuLi8uLi91dGlscy93YWxrJztcbmltcG9ydCB7IFR5cGVTY3JpcHRWaXNpdG9yIH0gZnJvbSAnLi92aXNpdG9yJztcbmltcG9ydCB7IEFTVE5vZGUgfSBmcm9tICcuLi9jb21tb24vYXN0JztcblxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgSmF2YVNjcmlwdCBjb21tZW50cy5cbiAqXG4gKiAjIEFQSVxuICpcbiAqIEBjbGFzcyBKYXZhU2NyaXB0UGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBAZXhwb3J0IGRlZmF1bHRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwZVNjcmlwdFBhcnNlciBpbXBsZW1lbnRzIFBhcnNlckludGVyZmFjZSB7XG4gIHByaXZhdGUgc291cmNlOiBTb3VyY2U7XG4gIHByaXZhdGUgb3B0aW9uczogYW55O1xuICBwcml2YXRlIHBhcnNlcjogUGFyc2VyO1xuICBwcml2YXRlIHRyZWVfOiBQYXJzZXIuVHJlZTtcbiAgY29uc3RydWN0b3Ioc291cmNlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zID0ge30sIG9wdGlvbnMgfHwge30pO1xuICAgIHRoaXMucGFyc2VyID0gbmV3IFBhcnNlcigpO1xuICAgIHRoaXMucGFyc2VyLnNldExhbmd1YWdlKFR5cGVTY3JpcHQpO1xuICAgIHRoaXMudHJlZV8gPSB0aGlzLnBhcnNlci5wYXJzZSh0aGlzLnNvdXJjZS50ZXh0KTtcbiAgfVxuICBwYXJzZSA9ICgpOiBBU1ROb2RlW10gPT4ge1xuICAgIGNvbnN0IHZpc2l0b3IgPSBuZXcgVHlwZVNjcmlwdFZpc2l0b3IodGhpcy5zb3VyY2UpO1xuICAgIGNvbnN0IHJvb3QgPSB3YWxrKHRoaXMudHJlZV8ucm9vdE5vZGUpO1xuICAgIC8vIGNvbnNvbGUudGltZSgndmlzaXQnKVxuICAgIHJvb3QudmlzaXQodmlzaXRvcilcbiAgICAvLyBjb25zb2xlLnRpbWVFbmQoJ3Zpc2l0JylcbiAgICByZXR1cm4gdmlzaXRvci5nZXRBU1QoKTtcbiAgfVxuXG4gIGdldCB0cmVlICgpOiBQYXJzZXIuVHJlZSB7XG4gICAgcmV0dXJuIHRoaXMudHJlZV87XG4gIH1cbn1cbiJdfQ==