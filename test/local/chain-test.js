/*global describe,before,it,after */
var test;

test = require('../common/chain-test-base').test;

describe("wd", function() {
  describe("local", function() {
    describe("chain tests", function() {
      describe("using chrome", function() {
        test('chrome');
      });
      describe("using firefox", function() {
        test('firefox');
      });
    });
  });
});
