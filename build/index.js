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
}
exports.default = Parser;
const path = `${process.cwd()}/example.ts`;
const result = new Parser({
    name: 'index.ts',
    path: path,
    text: FS.readFileSync(path, 'utf-8')
}, {
    language: 'typescript'
}).parse();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFDekIsbURBQW1EO0FBQ25EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFxQixNQUFNO0lBR3pCLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUczQyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzVCLENBQUMsQ0FBQTtRQUpDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDL0QsQ0FBQztDQUlGO0FBVEQseUJBU0M7QUFDRCxNQUFNLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDO0FBQzNDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxVQUFVO0lBQ2hCLElBQUksRUFBRSxJQUFJO0lBQ1YsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztDQUNyQyxFQUFFO0lBQ0QsUUFBUSxFQUFFLFlBQVk7Q0FDdkIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgUGFyc2VyRmFjdG9yeSBmcm9tICcuL3NyYy9QYXJzZXJGYWN0b3J5JztcbmltcG9ydCBJUGFyc2VyIGZyb20gJy4vc3JjL2ludGVyZmFjZXMvSVBhcnNlcic7XG5pbXBvcnQgKiBhcyBGUyBmcm9tICdmcyc7XG4vLyBpbXBvcnQgeyBBU1ROb2RlIH0gZnJvbSAnLi9zcmMvbGFuZy9jb21tb24vYXN0Jztcbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBhIHNvdXJjZSBjb2RlIGFuZCBnZW5lcmF0ZXMgYW4gQVNULlxuICogXG4gKiBAY2xhc3MgUGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBcbiAqICMgRXhhbXBsZVxuICogXG4gKiBgYGBqc1xuICogY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih7XG4gKiAgbmFtZTogJy4uLicsXG4gKiAgcGF0aDogJy4uLi4nLFxuICogIHRleHQ6ICcuLi4nXG4gKiB9LCB7IGxhbmd1YWdlOiAndHlwZXNjcmlwdCcgfSk7XG4gKiBcbiAqIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZSgpO1xuICogXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XG5cbiAgcHJpdmF0ZSBwYXJzZXI6IElQYXJzZXI7XG4gIGNvbnN0cnVjdG9yKGZpbGU6IFNvdXJjZSwgb3B0aW9uczogYW55ID0ge30pIHtcbiAgICB0aGlzLnBhcnNlciA9IChuZXcgUGFyc2VyRmFjdG9yeShmaWxlLCBvcHRpb25zKSkuZ2V0UGFyc2VyKCk7XG4gIH1cbiAgcGFyc2UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VyLnBhcnNlKClcbiAgfVxufVxuY29uc3QgcGF0aCA9IGAke3Byb2Nlc3MuY3dkKCl9L2V4YW1wbGUudHNgO1xuY29uc3QgcmVzdWx0ID0gbmV3IFBhcnNlcih7XG4gIG5hbWU6ICdpbmRleC50cycsXG4gIHBhdGg6IHBhdGgsXG4gIHRleHQ6IEZTLnJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKVxufSwge1xuICBsYW5ndWFnZTogJ3R5cGVzY3JpcHQnXG59KS5wYXJzZSgpOyJdfQ==