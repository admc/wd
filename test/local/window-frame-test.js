/*global describe,before,it,after */
var test;

test = require('../common/window-frame-test-base').test;

describe("wd", function() {
  describe("local", function() {
    describe("window frame test", function() {
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
