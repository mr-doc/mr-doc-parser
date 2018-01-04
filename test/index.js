"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
/* eslint-env mocha */
const assert = require('chai').assert;
const Parser = require('../').default;
describe('Parser', () => {
    describe('JavaScript (Babel)', function () {
        const source = fs_1.readFileSync(path_1.join(__dirname, 'fixtures') + '/test.js', 'utf8');
        it('should return an object containing the parsed comments', () => {
            const result = new Parser({ language: 'js' }).parse({ name: 'index.js', source });
            assert.isObject(result);
            assert.isTrue(result.comments.length === 1);
        });
    });
});
//# sourceMappingURL=index.js.map