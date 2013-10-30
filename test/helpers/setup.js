require('./env');

GLOBAL._ = require('lodash');

GLOBAL.wd = require('../../lib/main');

// monkey patching
wd.webdriver.prototype.configureLogging = function (done){
  if(env.VERBOSE) {
    //browser._debugPromise();
    this.on('status', function(info) {
      console.log(info);
    });
    this.on('command', function(meth, path, data) {
      console.log(' > ' + meth, path, data || '');
    });
  }
  done();
};

wd.rewrap();

GLOBAL.midwayUrl = function(testSuite, title){
  var cleanTitle = title.replace(/@[-\w]+/g, '').trim();
  return env.MIDWAY_ROOT_URL + '/test-page' +
    '?p=' + encodeURIComponent(cleanTitle) +
    '&ts=' + encodeURIComponent(testSuite);
};

GLOBAL.mergeDesired = function(desired, extra){
  desired = _.clone(desired);
  if(!extra) { return desired; }
  _(extra).each(function(value, key) {
    if(key === 'tags'){
      desired[key] = _.union(desired[key], extra[key]);
    } else {
      desired[key] = extra[key] || desired[key];
    }
  });
  return desired;
};

GLOBAL.sauceJobTitle = function(title) {
  return (env.TRAVIS_JOB_NUMBER? '[' + env.TRAVIS_JOB_NUMBER + '] ' : '') +
    title
      .replace(/\(.*\)/g,'')
      .replace(/\@[\w\-]+/g,'')
      .trim();
};

GLOBAL.Q = GLOBAL.wd.Q;

require("mocha-as-promised")();
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
GLOBAL.expect = chai.expect;
GLOBAL.should = chai.should();

GLOBAL.Express = require("./express-helper").Express;
