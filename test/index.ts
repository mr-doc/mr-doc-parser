import { readFileSync } from 'fs';
import { join } from 'path';

/* eslint-env mocha */
const assert = require('chai').assert;
const Parser = require('../').default;

describe('Parser', () => {
  
  describe('JavaScript (Babel)', function () {
    const source = readFileSync(join(__dirname, 'fixtures') + '/test.js', 'utf8');
    it('should return an object containing the parsed comments', () => {
      const result = new Parser({ language: 'js' }).parse({ name: 'index.js', source });
      assert.isObject(result);
      assert.isTrue(result.comments.length === 1);
    });
  });
});
