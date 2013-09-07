require("mocha-as-promised")();

var chai = require("chai");
chai.should();

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var Q = require('q');
var wd = require('./wd-with-cov');

var verbose = true;

var initBrowser = function(remoteWdConfig) {
  var browser = wd.promiseRemote(remoteWdConfig);
  return browser.init({
    browserName: 'chrome'
  }).then(function() {
    if(verbose && !process.env.WD_COV) {
      browser._debugPromise();
      browser.on('status', function(info) {
        console.log(info);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth, path, data || '');
      });
    }
  });
};

var TIMEOUT = 60000;

var test = function(remoteWdConfig, desired, markAsPassed) {
  var browser, sessionID;

  if (typeof remoteWdConfig === 'function') {
    remoteWdConfig = remoteWdConfig();
  }

  describe("promises chain", function() {
    this.timeout(TIMEOUT);

    before(function() {
      browser = initBrowser(remoteWdConfig);
      return browser
        .then( function() {sessionID = browser.sessionID;})
        .should.be.fulfilled;
    });

    beforeEach(function() {
      return browser
        .get("http://admc.io/wd/test-pages/guinea-pig.html");
    });

    after( function() {
      return browser.quit();
    });

    describe("browsing", function() {
      describe("checking title", function() {
        it("should navigate to test page and check title", function() {
          return browser
            .title().should.eventually.contain("I am a page title - Sauce Labs");
        });
      });

      describe("getting subelement", function() {
        it("subelement value should be retrieved", function() {
          return browser
            .elementById('the_forms_id')
            .elementById('>', 'unchecked_checkbox').then(function(el) {
              return Q.all([
                el.click().click().getAttribute('type').should.become('checkbox'),
                el.getAttribute('type').should.become('checkbox'),
                el.getAttribute('type').should.become('checkbox')
              ]);
            });
        });
      });
      describe("clicking submit", function() {
        it("submit element should be clicked", function() {
          return browser
            .elementById("submit")
            .click()
            .eval("window.location.href")
            .should.eventually.contain("http://");
        });
      });
    });

    if(markAsPassed) {
      describe("marking job as passed", function() {
        it("should mark job ass passed", function(done) {
          markAsPassed(sessionID, done);
        });
      });
    }


  });
};

exports.test = test;
