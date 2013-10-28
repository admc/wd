GLOBAL.env = require('./env');

GLOBAL._ = require('lodash');
GLOBAL.wd = require('../../lib/main');
GLOBAL.Q = GLOBAL.wd.Q;

require("mocha-as-promised")();
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.promisifyWith(wd.buildPromisify());
GLOBAL.expect = chai.expect;
GLOBAL.should = chai.should();

var Express = require("./express-helper").Express;
var sauce = require('./sauce-helper');

module.exports = {
  remoteConfig: env.REMOTE_CONFIG,
  desired: env.DESIRED,
  desiredWithTestInfo: function(testInfo) {
    var desired = _.clone(env.DESIRED);
    if(env.SAUCE){
      if(testInfo && testInfo.name) { desired.name = testInfo.name; }
      if(testInfo && testInfo.tags) {
        desired.tags = _.union(desired.tags, testInfo.tags);
      }
    }
    if(env.TRAVIS_JOB_NUMBER){
      desired['tunnel-identifier'] = env.TRAVIS_JOB_NUMBER;
    }
    return desired;
  },
  testEnv: 'local/' + env.DESIRED.browserName,
  TIMEOUT_BASE: env.TIMEOUT_BASE,
  isBrowser: function(browserName){
    return env.DESIRED.browserName === browserName;
  },
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
  _jobStatus: sauce.jobStatus,
  _jobUpdate: sauce.jobUpdate
};

