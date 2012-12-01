/*global describe,before,it,after */
var test;

test = require('../common/typing-test-base').test;

describe("wd", function() {
  describe("local", function() {
    describe("typing test", function() {
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
