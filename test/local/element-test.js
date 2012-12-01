/*global describe,before,it,after */
var test;

test = require('../common/element-test-base').test;

describe("wd", function() {
  describe("local", function() {
    describe("element tests", function() {
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
