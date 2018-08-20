"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserFactory_1 = require("./src/ParserFactory");
const FS = require("fs");
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
}
exports.default = Parser;
const result = new Parser({
    name: 'index.ts',
    path: '../../',
    text: FS.readFileSync(`${process.cwd()}/example.ts`, 'utf-8')
}, {
    language: 'typescript'
}).parse();
console.log(JSON.stringify(result, null, 2));
// console.log(result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFFekI7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQXFCLE1BQU07SUFHekIsWUFBWSxJQUFXLEVBQUUsVUFBZSxFQUFFO1FBRzFDLFVBQUssR0FBRyxHQUFHLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBSkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0NBSUY7QUFURCx5QkFTQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxVQUFVO0lBQ2hCLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUM7Q0FDOUQsRUFBRTtJQUNELFFBQVEsRUFBRSxZQUFZO0NBQ3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUdYLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUMsdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IElGaWxlIGZyb20gJy4vc3JjL2ludGVyZmFjZXMvSUZpbGUnO1xyXG5pbXBvcnQgUGFyc2VyRmFjdG9yeSBmcm9tICcuL3NyYy9QYXJzZXJGYWN0b3J5JztcclxuaW1wb3J0IElQYXJzZXIgZnJvbSAnLi9zcmMvaW50ZXJmYWNlcy9JUGFyc2VyJztcclxuaW1wb3J0ICogYXMgRlMgZnJvbSAnZnMnO1xyXG5cclxuLyoqXHJcbiAqIEEgY2xhc3MgdGhhdCBwYXJzZXMgYSBzb3VyY2UgY29kZSBhbmQgZ2VuZXJhdGVzIGFuIEFTVC5cclxuICogXHJcbiAqIEBjbGFzcyBQYXJzZXJcclxuICogQGltcGxlbWVudHMgSVBhcnNlclxyXG4gKiBcclxuICogIyBFeGFtcGxlXHJcbiAqIFxyXG4gKiBgYGBqc1xyXG4gKiBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKHtcclxuICogIG5hbWU6ICcuLi4nLFxyXG4gKiAgcGF0aDogJy4uLi4nLFxyXG4gKiAgdGV4dDogJy4uLidcclxuICogfSwgeyBsYW5ndWFnZTogJ3R5cGVzY3JpcHQnIH0pO1xyXG4gKiBcclxuICogY29uc3QgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKCk7XHJcbiAqIFxyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnNlciBpbXBsZW1lbnRzIElQYXJzZXIge1xyXG5cclxuICBwcml2YXRlIHBhcnNlcjogSVBhcnNlcjtcclxuICBjb25zdHJ1Y3RvcihmaWxlOiBJRmlsZSwgb3B0aW9uczogYW55ID0ge30pIHtcclxuICAgIHRoaXMucGFyc2VyID0gKG5ldyBQYXJzZXJGYWN0b3J5KGZpbGUsIG9wdGlvbnMpKS5nZXRQYXJzZXIoKTtcclxuICB9XHJcbiAgcGFyc2UgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gdGhpcy5wYXJzZXIucGFyc2UoKVxyXG4gIH1cclxufVxyXG5cclxuY29uc3QgcmVzdWx0ID0gbmV3IFBhcnNlcih7XHJcbiAgbmFtZTogJ2luZGV4LnRzJyxcclxuICBwYXRoOiAnLi4vLi4vJyxcclxuICB0ZXh0OiBGUy5yZWFkRmlsZVN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vZXhhbXBsZS50c2AsICd1dGYtOCcpXHJcbn0sIHtcclxuICBsYW5ndWFnZTogJ3R5cGVzY3JpcHQnXHJcbn0pLnBhcnNlKCk7XHJcblxyXG5cclxuY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSlcclxuLy8gY29uc29sZS5sb2cocmVzdWx0KTtcclxuIl19