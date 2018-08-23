"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserFactory_1 = require("./src/ParserFactory");
const FS = require("fs");
// import { ASTNode } from './src/lang/common/ast';
/**
 * A class that parses a source code and generates an AST.
 *
 * @class Parser
 * @implements IParser
 *
 * # Example
 *
 * ```js
 * const parser = new Parser({
 *  name: '...',
 *  path: '....',
 *  text: '...'
 * }, { language: 'typescript' });
 *
 * const result = parser.parse();
 *
 * ```
 */
class Parser {
    constructor(file, options = {}) {
        this.parse = () => {
            return this.parser.parse();
        };
        this.parser = (new ParserFactory_1.default(file, options)).getParser();
    }
    get tree() {
        return this.parser.tree;
    }
}
exports.default = Parser;
const path = `${process.cwd()}/corpus/example.js`;
const result = new Parser({
    name: 'index.ts',
    path: path,
    text: FS.readFileSync(path, 'utf-8')
}, {
    language: 'javascript'
}).parse();
console.log(result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFFekIsbURBQW1EO0FBQ25EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFxQixNQUFNO0lBR3pCLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUczQyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzVCLENBQUMsQ0FBQTtRQUpDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDL0QsQ0FBQztJQUlELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztDQUNGO0FBWkQseUJBWUM7QUFFRCxNQUFNLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLENBQUM7QUFDbEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDeEIsSUFBSSxFQUFFLFVBQVU7SUFDaEIsSUFBSSxFQUFFLElBQUk7SUFDVixJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO0NBQ3JDLEVBQUU7SUFDRCxRQUFRLEVBQUUsWUFBWTtDQUN2QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFFWCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL1NvdXJjZSc7XHJcbmltcG9ydCBQYXJzZXJGYWN0b3J5IGZyb20gJy4vc3JjL1BhcnNlckZhY3RvcnknO1xyXG5pbXBvcnQgUGFyc2VySW50ZXJmYWNlIGZyb20gJy4vc3JjL2ludGVyZmFjZXMvUGFyc2VySW50ZXJmYWNlJztcclxuaW1wb3J0ICogYXMgRlMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBUcmVlIH0gZnJvbSAndHJlZS1zaXR0ZXInO1xyXG4vLyBpbXBvcnQgeyBBU1ROb2RlIH0gZnJvbSAnLi9zcmMvbGFuZy9jb21tb24vYXN0JztcclxuLyoqXHJcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgYSBzb3VyY2UgY29kZSBhbmQgZ2VuZXJhdGVzIGFuIEFTVC5cclxuICogXHJcbiAqIEBjbGFzcyBQYXJzZXJcclxuICogQGltcGxlbWVudHMgSVBhcnNlclxyXG4gKiBcclxuICogIyBFeGFtcGxlXHJcbiAqIFxyXG4gKiBgYGBqc1xyXG4gKiBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKHtcclxuICogIG5hbWU6ICcuLi4nLFxyXG4gKiAgcGF0aDogJy4uLi4nLFxyXG4gKiAgdGV4dDogJy4uLidcclxuICogfSwgeyBsYW5ndWFnZTogJ3R5cGVzY3JpcHQnIH0pO1xyXG4gKiBcclxuICogY29uc3QgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKCk7XHJcbiAqIFxyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciBpbXBsZW1lbnRzIFBhcnNlckludGVyZmFjZSB7XHJcblxyXG4gIHByaXZhdGUgcGFyc2VyOiBQYXJzZXJJbnRlcmZhY2U7XHJcbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkgPSB7fSkge1xyXG4gICAgdGhpcy5wYXJzZXIgPSAobmV3IFBhcnNlckZhY3RvcnkoZmlsZSwgb3B0aW9ucykpLmdldFBhcnNlcigpO1xyXG4gIH1cclxuICBwYXJzZSA9ICgpID0+IHtcclxuICAgIHJldHVybiB0aGlzLnBhcnNlci5wYXJzZSgpXHJcbiAgfVxyXG4gIGdldCB0cmVlICgpOiBUcmVlIHtcclxuICAgIHJldHVybiB0aGlzLnBhcnNlci50cmVlO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgcGF0aCA9IGAke3Byb2Nlc3MuY3dkKCl9L2NvcnB1cy9leGFtcGxlLmpzYDtcclxuY29uc3QgcmVzdWx0ID0gbmV3IFBhcnNlcih7XHJcbiAgbmFtZTogJ2luZGV4LnRzJyxcclxuICBwYXRoOiBwYXRoLFxyXG4gIHRleHQ6IEZTLnJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKVxyXG59LCB7XHJcbiAgbGFuZ3VhZ2U6ICdqYXZhc2NyaXB0J1xyXG59KS5wYXJzZSgpO1xyXG5cclxuY29uc29sZS5sb2cocmVzdWx0KTtcclxuIl19