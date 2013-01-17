console.log("------ process.env:", process.env);
var test;

test = require('../common/basic-test-base').test;

describe("wd", function() {
  describe("local", function() {
    describe("basic test", function() {
      if(!process.env.TRAVIS_JOB_ID){
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
