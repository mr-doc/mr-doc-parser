"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParserFactory_1 = require("./src/ParserFactory");
const parser_1 = require("./src/lang/common/parser");
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
class DocParser extends parser_1.default {
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
exports.default = DocParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVEQUFnRDtBQUNoRCxxREFBOEM7QUFHOUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQXFCLFNBQVUsU0FBUSxnQkFBTTtJQUczQyxZQUFZLE1BQWMsRUFBRSxPQUFnQjtRQUMxQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBR3hCLFVBQUssR0FBRyxHQUFHLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDNUIsQ0FBQyxDQUFBO1FBSkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzNFLENBQUM7SUFJRCxJQUFJLElBQUk7UUFDTixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7Q0FDRjtBQWJELDRCQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNvdXJjZSBmcm9tICcuL3NyYy9pbnRlcmZhY2VzL1NvdXJjZSc7XG5pbXBvcnQgUGFyc2VyRmFjdG9yeSBmcm9tICcuL3NyYy9QYXJzZXJGYWN0b3J5JztcbmltcG9ydCBQYXJzZXIgZnJvbSAnLi9zcmMvbGFuZy9jb21tb24vcGFyc2VyJztcbmltcG9ydCB7IFRyZWUgfSBmcm9tICd0cmVlLXNpdHRlcic7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHBhcnNlcyBhIHNvdXJjZSBjb2RlIGFuZCBnZW5lcmF0ZXMgYW4gQVNULlxuICogXG4gKiBAY2xhc3MgUGFyc2VyXG4gKiBAaW1wbGVtZW50cyBJUGFyc2VyXG4gKiBcbiAqICMgRXhhbXBsZVxuICogXG4gKiBgYGBqc1xuICogY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih7XG4gKiAgbmFtZTogJy4uLicsXG4gKiAgcGF0aDogJy4uLi4nLFxuICogIHRleHQ6ICcuLi4nXG4gKiB9LCB7IGxhbmd1YWdlOiAndHlwZXNjcmlwdCcgfSk7XG4gKiBcbiAqIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZSgpO1xuICogXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jUGFyc2VyIGV4dGVuZHMgUGFyc2VyIHtcblxuICBwcml2YXRlIHBhcnNlcjogUGFyc2VyO1xuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IFNvdXJjZSwgb3B0aW9ucz86IG9iamVjdCkge1xuICAgIHN1cGVyKHNvdXJjZSwgb3B0aW9ucylcbiAgICB0aGlzLnBhcnNlciA9IChuZXcgUGFyc2VyRmFjdG9yeSh0aGlzLnNvdXJjZSwgdGhpcy5vcHRpb25zKSkuZ2V0UGFyc2VyKCk7XG4gIH1cbiAgcGFyc2UgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VyLnBhcnNlKClcbiAgfVxuICBnZXQgdHJlZSAoKTogVHJlZSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2VyLnRyZWU7XG4gIH1cbn1cbiJdfQ==