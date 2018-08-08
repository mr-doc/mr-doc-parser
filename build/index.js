"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserFactory_1 = require("./src/ParserFactory");
const FS = require("fs");
/**
 * A class that parses a source code and generates
 *
 * # API
 *
 * ```
 * @class Parser
 * @implements IParser
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
    text: FS.readFileSync(`${process.cwd()}/index.ts`, 'utf-8')
}, {
    language: 'typescript'
}).parse();
// console.log(JSON.stringify(result, null, 2))
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHVEQUFnRDtBQUVoRCx5QkFBeUI7QUFFekI7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBcUIsTUFBTTtJQUd6QixZQUFZLElBQVcsRUFBRSxVQUFlLEVBQUU7UUFHMUMsVUFBSyxHQUFHLEdBQVksRUFBRTtZQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBSkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0NBSUY7QUFURCx5QkFTQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ3hCLElBQUksRUFBRSxVQUFVO0lBQ2hCLElBQUksRUFBRSxRQUFRO0lBQ2QsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUM7Q0FDNUQsRUFBRTtJQUNELFFBQVEsRUFBRSxZQUFZO0NBQ3ZCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUdYLCtDQUErQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJRmlsZSBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL0lGaWxlJztcbmltcG9ydCBJUmVzdWx0IGZyb20gJy4vc3JjL2ludGVyZmFjZXMvSVJlc3VsdCc7XG5pbXBvcnQgUGFyc2VyRmFjdG9yeSBmcm9tICcuL3NyYy9QYXJzZXJGYWN0b3J5JztcbmltcG9ydCBJUGFyc2VyIGZyb20gJy4vc3JjL2ludGVyZmFjZXMvSVBhcnNlcic7XG5pbXBvcnQgKiBhcyBGUyBmcm9tICdmcyc7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBhIHNvdXJjZSBjb2RlIGFuZCBnZW5lcmF0ZXNcbiAqIFxuICogIyBBUElcbiAqIFxuICogYGBgXG4gKiBAY2xhc3MgUGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFyc2VyIGltcGxlbWVudHMgSVBhcnNlciB7XG5cbiAgcHJpdmF0ZSBwYXJzZXI6IElQYXJzZXI7XG4gIGNvbnN0cnVjdG9yKGZpbGU6IElGaWxlLCBvcHRpb25zOiBhbnkgPSB7fSkge1xuICAgIHRoaXMucGFyc2VyID0gKG5ldyBQYXJzZXJGYWN0b3J5KGZpbGUsIG9wdGlvbnMpKS5nZXRQYXJzZXIoKTtcbiAgfVxuICBwYXJzZSA9ICgpOiBJUmVzdWx0ID0+IHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZXIucGFyc2UoKVxuICB9XG59XG5cbmNvbnN0IHJlc3VsdCA9IG5ldyBQYXJzZXIoe1xuICBuYW1lOiAnaW5kZXgudHMnLFxuICBwYXRoOiAnLi4vLi4vJyxcbiAgdGV4dDogRlMucmVhZEZpbGVTeW5jKGAke3Byb2Nlc3MuY3dkKCl9L2luZGV4LnRzYCwgJ3V0Zi04Jylcbn0sIHtcbiAgbGFuZ3VhZ2U6ICd0eXBlc2NyaXB0J1xufSkucGFyc2UoKTtcblxuXG4vLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDIpKSJdfQ==