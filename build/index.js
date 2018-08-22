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
// console.log(JSON.stringify(result, null, 2))
console.log(result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFFekI7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQXFCLE1BQU07SUFHekIsWUFBWSxJQUFZLEVBQUUsVUFBZSxFQUFFO1FBRzNDLFVBQUssR0FBRyxHQUFHLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBSkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0NBSUY7QUFURCx5QkFTQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxVQUFVO0lBQ2hCLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUM7Q0FDOUQsRUFBRTtJQUNELFFBQVEsRUFBRSxZQUFZO0NBQ3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUdYLCtDQUErQztBQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL1NvdXJjZSc7XHJcbmltcG9ydCBQYXJzZXJGYWN0b3J5IGZyb20gJy4vc3JjL1BhcnNlckZhY3RvcnknO1xyXG5pbXBvcnQgSVBhcnNlciBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL0lQYXJzZXInO1xyXG5pbXBvcnQgKiBhcyBGUyBmcm9tICdmcyc7XHJcblxyXG4vKipcclxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBhIHNvdXJjZSBjb2RlIGFuZCBnZW5lcmF0ZXMgYW4gQVNULlxyXG4gKiBcclxuICogQGNsYXNzIFBhcnNlclxyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXHJcbiAqIFxyXG4gKiAjIEV4YW1wbGVcclxuICogXHJcbiAqIGBgYGpzXHJcbiAqIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIoe1xyXG4gKiAgbmFtZTogJy4uLicsXHJcbiAqICBwYXRoOiAnLi4uLicsXHJcbiAqICB0ZXh0OiAnLi4uJ1xyXG4gKiB9LCB7IGxhbmd1YWdlOiAndHlwZXNjcmlwdCcgfSk7XHJcbiAqIFxyXG4gKiBjb25zdCByZXN1bHQgPSBwYXJzZXIucGFyc2UoKTtcclxuICogXHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XHJcblxyXG4gIHByaXZhdGUgcGFyc2VyOiBJUGFyc2VyO1xyXG4gIGNvbnN0cnVjdG9yKGZpbGU6IFNvdXJjZSwgb3B0aW9uczogYW55ID0ge30pIHtcclxuICAgIHRoaXMucGFyc2VyID0gKG5ldyBQYXJzZXJGYWN0b3J5KGZpbGUsIG9wdGlvbnMpKS5nZXRQYXJzZXIoKTtcclxuICB9XHJcbiAgcGFyc2UgPSAoKSA9PiB7XHJcbiAgICByZXR1cm4gdGhpcy5wYXJzZXIucGFyc2UoKVxyXG4gIH1cclxufVxyXG5cclxuY29uc3QgcmVzdWx0ID0gbmV3IFBhcnNlcih7XHJcbiAgbmFtZTogJ2luZGV4LnRzJyxcclxuICBwYXRoOiAnLi4vLi4vJyxcclxuICB0ZXh0OiBGUy5yZWFkRmlsZVN5bmMoYCR7cHJvY2Vzcy5jd2QoKX0vZXhhbXBsZS50c2AsICd1dGYtOCcpXHJcbn0sIHtcclxuICBsYW5ndWFnZTogJ3R5cGVzY3JpcHQnXHJcbn0pLnBhcnNlKCk7XHJcblxyXG5cclxuLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSlcclxuY29uc29sZS5sb2cocmVzdWx0KTtcclxuIl19