"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserFactory_1 = require("./src/ParserFactory");
const parser_1 = require("./src/lang/common/parser");
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
class MainParser extends parser_1.default {
    constructor(source, options) {
        super(source, options);
        this.parse = () => {
            return this.parser.parse();
        };
        this.parser = (new ParserFactory_1.default(this.source, this.options)).getParser();
    }
    get tree() {
        return this.parser.tree;
    }
}
exports.default = MainParser;
const path = `${process.cwd()}/corpus/ReactElementValidator.txt`;
const result = new MainParser({
    name: 'index.ts',
    path: path,
    text: FS.readFileSync(path, 'utf-8')
}, {
    language: 'ts'
}).parse();
// console.log(result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUNoRCxxREFBOEM7QUFDOUMseUJBQXlCO0FBRXpCLG1EQUFtRDtBQUNuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsTUFBcUIsVUFBVyxTQUFRLGdCQUFNO0lBRzVDLFlBQVksTUFBYyxFQUFFLE9BQVk7UUFDdEMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUd4QixVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1FBQzVCLENBQUMsQ0FBQTtRQUpDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLHVCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMzRSxDQUFDO0lBSUQsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUMxQixDQUFDO0NBQ0Y7QUFiRCw2QkFhQztBQUVELE1BQU0sSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxtQ0FBbUMsQ0FBQztBQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQztJQUM1QixJQUFJLEVBQUUsVUFBVTtJQUNoQixJQUFJLEVBQUUsSUFBSTtJQUNWLElBQUksRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7Q0FDckMsRUFBRTtJQUNELFFBQVEsRUFBRSxJQUFJO0NBQ2YsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBRVgsdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL1NvdXJjZSc7XHJcbmltcG9ydCBQYXJzZXJGYWN0b3J5IGZyb20gJy4vc3JjL1BhcnNlckZhY3RvcnknO1xyXG5pbXBvcnQgUGFyc2VyIGZyb20gJy4vc3JjL2xhbmcvY29tbW9uL3BhcnNlcic7XHJcbmltcG9ydCAqIGFzIEZTIGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgVHJlZSB9IGZyb20gJ3RyZWUtc2l0dGVyJztcclxuLy8gaW1wb3J0IHsgQVNUTm9kZSB9IGZyb20gJy4vc3JjL2xhbmcvY29tbW9uL2FzdCc7XHJcbi8qKlxyXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIGEgc291cmNlIGNvZGUgYW5kIGdlbmVyYXRlcyBhbiBBU1QuXHJcbiAqIFxyXG4gKiBAY2xhc3MgUGFyc2VyXHJcbiAqIEBpbXBsZW1lbnRzIElQYXJzZXJcclxuICogXHJcbiAqICMgRXhhbXBsZVxyXG4gKiBcclxuICogYGBganNcclxuICogY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih7XHJcbiAqICBuYW1lOiAnLi4uJyxcclxuICogIHBhdGg6ICcuLi4uJyxcclxuICogIHRleHQ6ICcuLi4nXHJcbiAqIH0sIHsgbGFuZ3VhZ2U6ICd0eXBlc2NyaXB0JyB9KTtcclxuICogXHJcbiAqIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZSgpO1xyXG4gKiBcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWluUGFyc2VyIGV4dGVuZHMgUGFyc2VyIHtcclxuXHJcbiAgcHJpdmF0ZSBwYXJzZXI6IFBhcnNlcjtcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSwgb3B0aW9uczogYW55KSB7XHJcbiAgICBzdXBlcihzb3VyY2UsIG9wdGlvbnMpXHJcbiAgICB0aGlzLnBhcnNlciA9IChuZXcgUGFyc2VyRmFjdG9yeSh0aGlzLnNvdXJjZSwgdGhpcy5vcHRpb25zKSkuZ2V0UGFyc2VyKCk7XHJcbiAgfVxyXG4gIHBhcnNlID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuIHRoaXMucGFyc2VyLnBhcnNlKClcclxuICB9XHJcbiAgZ2V0IHRyZWUgKCk6IFRyZWUge1xyXG4gICAgcmV0dXJuIHRoaXMucGFyc2VyLnRyZWU7XHJcbiAgfVxyXG59XHJcblxyXG5jb25zdCBwYXRoID0gYCR7cHJvY2Vzcy5jd2QoKX0vY29ycHVzL1JlYWN0RWxlbWVudFZhbGlkYXRvci50eHRgO1xyXG5jb25zdCByZXN1bHQgPSBuZXcgTWFpblBhcnNlcih7XHJcbiAgbmFtZTogJ2luZGV4LnRzJyxcclxuICBwYXRoOiBwYXRoLFxyXG4gIHRleHQ6IEZTLnJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKVxyXG59LCB7XHJcbiAgbGFuZ3VhZ2U6ICd0cydcclxufSkucGFyc2UoKTtcclxuXHJcbi8vIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiJdfQ==