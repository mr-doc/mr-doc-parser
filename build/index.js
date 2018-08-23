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
const path = `${process.cwd()}/corpus/ReactElementValidator.txt`;
const result = new Parser({
    name: 'index.ts',
    path: path,
    text: FS.readFileSync(path, 'utf-8')
}, {
    language: 'ts'
}).parse();
// console.log(result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFFekIsbURBQW1EO0FBQ25EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFDSCxNQUFxQixNQUFNO0lBR3pCLFlBQVksSUFBWSxFQUFFLFVBQWUsRUFBRTtRQUczQyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzVCLENBQUMsQ0FBQTtRQUpDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLHVCQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDL0QsQ0FBQztJQUlELElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDMUIsQ0FBQztDQUNGO0FBWkQseUJBWUM7QUFFRCxNQUFNLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLENBQUM7QUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUM7SUFDeEIsSUFBSSxFQUFFLFVBQVU7SUFDaEIsSUFBSSxFQUFFLElBQUk7SUFDVixJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO0NBQ3JDLEVBQUU7SUFDRCxRQUFRLEVBQUUsSUFBSTtDQUNmLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUVYLHVCQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTb3VyY2UgZnJvbSAnLi9zcmMvaW50ZXJmYWNlcy9Tb3VyY2UnO1xuaW1wb3J0IFBhcnNlckZhY3RvcnkgZnJvbSAnLi9zcmMvUGFyc2VyRmFjdG9yeSc7XG5pbXBvcnQgUGFyc2VySW50ZXJmYWNlIGZyb20gJy4vc3JjL2ludGVyZmFjZXMvUGFyc2VySW50ZXJmYWNlJztcbmltcG9ydCAqIGFzIEZTIGZyb20gJ2ZzJztcbmltcG9ydCB7IFRyZWUgfSBmcm9tICd0cmVlLXNpdHRlcic7XG4vLyBpbXBvcnQgeyBBU1ROb2RlIH0gZnJvbSAnLi9zcmMvbGFuZy9jb21tb24vYXN0Jztcbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBhIHNvdXJjZSBjb2RlIGFuZCBnZW5lcmF0ZXMgYW4gQVNULlxuICogXG4gKiBAY2xhc3MgUGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBcbiAqICMgRXhhbXBsZVxuICogXG4gKiBgYGBqc1xuICogY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih7XG4gKiAgbmFtZTogJy4uLicsXG4gKiAgcGF0aDogJy4uLi4nLFxuICogIHRleHQ6ICcuLi4nXG4gKiB9LCB7IGxhbmd1YWdlOiAndHlwZXNjcmlwdCcgfSk7XG4gKiBcbiAqIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZSgpO1xuICogXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIGltcGxlbWVudHMgUGFyc2VySW50ZXJmYWNlIHtcblxuICBwcml2YXRlIHBhcnNlcjogUGFyc2VySW50ZXJmYWNlO1xuICBjb25zdHJ1Y3RvcihmaWxlOiBTb3VyY2UsIG9wdGlvbnM6IGFueSA9IHt9KSB7XG4gICAgdGhpcy5wYXJzZXIgPSAobmV3IFBhcnNlckZhY3RvcnkoZmlsZSwgb3B0aW9ucykpLmdldFBhcnNlcigpO1xuICB9XG4gIHBhcnNlID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLnBhcnNlci5wYXJzZSgpXG4gIH1cbiAgZ2V0IHRyZWUgKCk6IFRyZWUge1xuICAgIHJldHVybiB0aGlzLnBhcnNlci50cmVlO1xuICB9XG59XG5cbmNvbnN0IHBhdGggPSBgJHtwcm9jZXNzLmN3ZCgpfS9jb3JwdXMvUmVhY3RFbGVtZW50VmFsaWRhdG9yLnR4dGA7XG5jb25zdCByZXN1bHQgPSBuZXcgUGFyc2VyKHtcbiAgbmFtZTogJ2luZGV4LnRzJyxcbiAgcGF0aDogcGF0aCxcbiAgdGV4dDogRlMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGYtOCcpXG59LCB7XG4gIGxhbmd1YWdlOiAndHMnXG59KS5wYXJzZSgpO1xuXG4vLyBjb25zb2xlLmxvZyhyZXN1bHQpO1xuIl19