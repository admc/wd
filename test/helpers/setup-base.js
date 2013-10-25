GLOBAL.env = require("./env");

require("mocha-as-promised")();

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

GLOBAL.expect = chai.expect;
GLOBAL.should = chai.should();

GLOBAL.wd = require('../../lib/main');
GLOBAL.Q = GLOBAL.wd.Q;
GLOBAL._ = require('lodash');

var Express = require("./express-helper").Express;

var sauce = require('./sauce-helper');

module.exports = {
  remoteConfig: env.REMOTE_CONFIG,
  desired: env.DESIRED,
  desiredWithTestInfo: function(testInfo) {
    var desired = _.clone(env.DESIRED);
    if(env.SAUCE){
      if(testInfo.name) { desired.name = testInfo.name; }
      if(testInfo.tags) { desired.tags = _.union(desired.tags, testInfo.tags); }
    }
    return desired;
  },
  testEnv: 'local/' + env.DESIRED.browserName,
  TIMEOUT_BASE: env.TIMEOUT_BASE,
  isBrowser: function(browserName){
    return env.DESIRED.browserName === browserName;
  },
  urlRoot: 'http://localhost:8000/',
  Express: Express,
  configureLogging: function (browser){
    if(env.VERBOSE) {
      //browser._debugPromise();
      browser.on('status', function(info) {
        console.log(info);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth, path, data || '');
      });
    }
  },
  _jobStatus: sauce.jobStatus
};

