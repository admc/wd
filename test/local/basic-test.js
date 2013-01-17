var test = require('../common/basic-test-base').test,
    utils = require('../common/basic-test-base').utils;

describe("wd", function() {
  describe("local", function() {
    describe("basic test", function() {
      if(!utils.isTravis()){
        describe("using chrome", function() {
          test({}, {
            browserName: 'chrome'
          });
        });
      }
      describe("using firefox", function() {
        test({}, {
          browserName: 'firefox'
        });
      });
    });
  });
});
