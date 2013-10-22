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

var desired = process.env.DESIRED || {
  browserName: process.env.BROWSER || 'chrome'
};

// todo: coverage
// module.exports = process.env.WD_COV? require('../../lib-cov/main') : require('../../lib/main');

// todo: travis
// var isTravis = function () {
//   return process.env.TRAVIS_JOB_ID;
// };

var express = require('express');

function Express(rootDir) {
  this.rootDir = rootDir;
  this.partials = {};
}

Express.prototype.start = function() {
  this.app = express();
  this.app.set('view engine', 'hbs');
  this.app.set('views', this.rootDir + '/views');

  var partials = this.partials;
  this.app.get('/test-page', function(req, res) {
    var content = '';
    if(req.query.partial){
      content = partials[req.query.partial];
    }

    res.render('test-page', {
      testTitle: req.query.partial,
      content: content
    });
  });

  this.app.use(express["static"](this.rootDir + '/public'));
  this.server = this.app.listen(8181);

};

Express.prototype.stop = function() {
  return this.server.close();
};

module.exports = {
  desired: desired,
  testEnv: 'local/' + desired.browserName,
  TIMEOUT_BASE: process.env.TIMEOUT_BASE || 500,
  isBrowser: function(browserName){
    return desired.browserName === browserName;
  },
  urlRoot: 'http://localhost:8000/',
  Express: Express,
  configureLogging: function (){
    if(verbose) {
      //this.browser._debugPromise();
      this.browser.on('status', function(info) {
        console.log(info);
      });
      this.browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth, path, data || '');
      });
    }
  }
};

  // if(markAsPassed) {
  //   describe("marking job as passed", function() {
  //     it("should mark job ass passed", function(done) {
  //       markAsPassed(sessionID, done);
  //     });
  //   });
  // }

  //this.timeout(TIMEOUT);
