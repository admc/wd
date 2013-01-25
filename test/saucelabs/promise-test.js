/*global describe,before,it,after */
var chromeDesired, configHelper, explorerDesired, firefoxDesired, nameBase, remoteWdConfig, test;

test = require('../common/promise-test-base').test;

configHelper = require('./config-helper');

remoteWdConfig = configHelper.getRemoteWdConfig();

nameBase = "saucelabs basic test - ";

chromeDesired = {
  name: nameBase + 'chrome',
  browserName: 'chrome'
};

firefoxDesired = {
  name: nameBase + 'firefox',
  browserName: 'firefox'
};

explorerDesired = {
  name: nameBase + 'explorer',
  browserName: 'iexplore',
  version: '9',
  platform: 'Windows 2008'
};

describe("wd", function() {
  describe("saucelabs", function() {
    describe("promise tests", function() {
      describe("using chrome", function() {
        test(remoteWdConfig, chromeDesired, configHelper.jobPassed );
      });
      describe("using firefox", function() {
        test(remoteWdConfig, firefoxDesired, configHelper.jobPassed);
      });
      describe("using explorer", function() {
        test(remoteWdConfig, explorerDesired, configHelper.jobPassed);
      });
    });
  });
});
