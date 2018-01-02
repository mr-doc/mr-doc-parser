'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./src/javascript/index");
class Parser {
    constructor(options) {
        this.options = options;
    }
    /*
      @param file: IFile
     */
    parse(file) {
        switch (this.options.language) {
            case 'js':
            case 'javascript':
                return (new index_1.default().parse(file));
            default:
                return { type: '', file: { name: '', source: '' }, comments: [] };
        }
    }
}
exports.default = Parser;
//# sourceMappingURL=index.js.map