/* eslint-env mocha */
const assert = require('chai').assert;
const Parser = require('../').default;
const Option = require('mr-doc-utils').Option;

describe('Parser', () => {
  const source = `
    /**
     * @desc - Greet the user. 
     */
    function greet() {
      return 'Hello';
    }
  `;
  describe('JavaScript (Babel)', function () {
    it('should return an object containing the parsed comments', () => {
      const result = new Parser({ language: 'js' }).parse({ name: 'index.js', source });
      assert.isObject(result);
      assert.isTrue(result.comments.length === 1);
    });
  });
});
