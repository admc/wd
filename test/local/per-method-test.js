/*global describe,before,it,after */
var test;

test = require('../common/per-method-test-base').test;

describe("wd", function() {
  describe("local", function() {
    describe("per method tests", function() {
      describe("using chrome", function() {
        test({}, {
          browserName: 'chrome'
        });
      });
      describe("using firefox", function() {
        test({}, {
          browserName: 'firefox'
        });
      });
    });
  });
});
