require("mocha-as-promised")();

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
GLOBAL.expect = chai.expect;
GLOBAL.should = chai.should();

GLOBAL.wd = require('../../lib/main');
GLOBAL.Q = GLOBAL.wd.Q;
GLOBAL._ = require('lodash');

var verbose = process.env.VERBOSE || false;

var Express = require("./express-helper").Express;

var sauce = require('./sauce-helper');
sauce.configure();

var remoteConfig = process.env.REMOTE_CONFIG;
var desired = process.env.DESIRED? JSON.parse(process.env.DESIRED) : {
  browserName: process.env.BROWSER || 'chrome'
};

var TIMEOUT_BASE = process.env.TIMEOUT_BASE || 500;
TIMEOUT_BASE = parseInt(TIMEOUT_BASE, 10);

module.exports = {
  remoteConfig: remoteConfig,
  desired: desired,
  desiredWithTestInfo: function(testInfo) {
    var desired = _.clone(this.desired);
    if(process.env.SAUCE){
      if(testInfo.name) { desired.name = testInfo.name; }
      if(testInfo.tags) { desired.tags = _.union(desired.tags, testInfo.tags); }
    }
    return desired;
  },
  testEnv: 'local/' + desired.browserName,
  TIMEOUT_BASE: TIMEOUT_BASE,
  isBrowser: function(browserName){
    return desired.browserName === browserName;
  },
  urlRoot: 'http://localhost:8000/',
  Express: Express,
  isTravis: function () { return process.env.TRAVIS_JOB_ID; },
  configureLogging: function (browser){
    if(verbose) {
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

