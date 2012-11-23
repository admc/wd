var desired, remoteWdConfig, test, _ref;

_ref = require('./config'); 
desired = _ref.desired;
remoteWdConfig = _ref.remoteWdConfig;

test = require('../common/typing-test-base').test;

describe("wd", function() {
  return describe("ghostdriver", function() {
    return describe("typing test", function() {
      return describe("using chrome", function() {
        return test(remoteWdConfig, desired);
      });
    });
  });
});
