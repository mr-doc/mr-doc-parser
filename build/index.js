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
// console.log(result);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFFekI7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQXFCLE1BQU07SUFHekIsWUFBWSxJQUFZLEVBQUUsVUFBZSxFQUFFO1FBRzNDLFVBQUssR0FBRyxHQUFHLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBSkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0NBSUY7QUFURCx5QkFTQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxVQUFVO0lBQ2hCLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUM7Q0FDOUQsRUFBRTtJQUNELFFBQVEsRUFBRSxZQUFZO0NBQ3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUdYLCtDQUErQztBQUMvQyx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU291cmNlIGZyb20gJy4vc3JjL2ludGVyZmFjZXMvU291cmNlJztcbmltcG9ydCBQYXJzZXJGYWN0b3J5IGZyb20gJy4vc3JjL1BhcnNlckZhY3RvcnknO1xuaW1wb3J0IElQYXJzZXIgZnJvbSAnLi9zcmMvaW50ZXJmYWNlcy9JUGFyc2VyJztcbmltcG9ydCAqIGFzIEZTIGZyb20gJ2ZzJztcblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgcGFyc2VzIGEgc291cmNlIGNvZGUgYW5kIGdlbmVyYXRlcyBhbiBBU1QuXG4gKiBcbiAqIEBjbGFzcyBQYXJzZXJcbiAqIEBpbXBsZW1lbnRzIElQYXJzZXJcbiAqIFxuICogIyBFeGFtcGxlXG4gKiBcbiAqIGBgYGpzXG4gKiBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKHtcbiAqICBuYW1lOiAnLi4uJyxcbiAqICBwYXRoOiAnLi4uLicsXG4gKiAgdGV4dDogJy4uLidcbiAqIH0sIHsgbGFuZ3VhZ2U6ICd0eXBlc2NyaXB0JyB9KTtcbiAqIFxuICogY29uc3QgcmVzdWx0ID0gcGFyc2VyLnBhcnNlKCk7XG4gKiBcbiAqIGBgYFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXJzZXIgaW1wbGVtZW50cyBJUGFyc2VyIHtcblxuICBwcml2YXRlIHBhcnNlcjogSVBhcnNlcjtcbiAgY29uc3RydWN0b3IoZmlsZTogU291cmNlLCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHRoaXMucGFyc2VyID0gKG5ldyBQYXJzZXJGYWN0b3J5KGZpbGUsIG9wdGlvbnMpKS5nZXRQYXJzZXIoKTtcbiAgfVxuICBwYXJzZSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZXIucGFyc2UoKVxuICB9XG59XG5cbmNvbnN0IHJlc3VsdCA9IG5ldyBQYXJzZXIoe1xuICBuYW1lOiAnaW5kZXgudHMnLFxuICBwYXRoOiAnLi4vLi4vJyxcbiAgdGV4dDogRlMucmVhZEZpbGVTeW5jKGAke3Byb2Nlc3MuY3dkKCl9L2V4YW1wbGUudHNgLCAndXRmLTgnKVxufSwge1xuICBsYW5ndWFnZTogJ3R5cGVzY3JpcHQnXG59KS5wYXJzZSgpO1xuXG5cbi8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMikpXG4vLyBjb25zb2xlLmxvZyhyZXN1bHQpO1xuIl19