/*global describe,before,it,after */
var TIMEOUT, assert, should, test;

require("mocha-as-promised")();

should = require('should');

assert = require('assert');

TIMEOUT = 60000;

test = function(remoteWdConfig, desired, markAsPassed) {
  var sessionID;
  var browser, wd;
  wd = require('./wd-with-cov');
  if (typeof remoteWdConfig === 'function') {
    remoteWdConfig = remoteWdConfig();
  }
  browser = null;
  
  after(function(done) {
    if(markAsPassed) {
      markAsPassed(sessionID, done);
    } else {
      done(null);
    }
  });
  
  describe("remote", function() {
    it("should create browser", function(done) {
      browser = wd.remote(remoteWdConfig);
      should.exist(browser);
      if (!process.env.WD_COV) {
        browser.on("status", function(info) {
          console.log("\u001b[36m%s\u001b[0m", info);
        });
        browser.on("command", function(meth, path) {
          console.log(" > \u001b[33m%s\u001b[0m: %s", meth, path);
        });
      }
      done(null);
    });
  });
  describe("init", function() {
    it("should initialize browser", function(done) {
      this.timeout(TIMEOUT);
      browser.init(desired, function() {
        sessionID = browser.sessionID;
        done(null);
      });
    });
  });
  describe("browsing", function() {
    describe("getting page", function() {
      it("should navigate to test page and check title", function(done) {
        this.timeout(TIMEOUT);
        browser.get("http://admc.io/wd/test-pages/guinea-pig.html", function(err) {
          if(err) { console.log(err); done(err); }
          browser.title(function(err, title) {
            if(err) { console.log(err); done(err); }
            assert.ok(~title.indexOf("I am a page title - Sauce Labs"), "Wrong title!");
            done(null);
          });
        });
      });
    });
    describe("clicking submit", function() {
      it("submit element should be clicked", function(done) {
        this.timeout(TIMEOUT);
        browser.elementById("submit", function(err, el) {
          browser.clickElement(el, function() {
            browser["eval"]("window.location.href", function(err, location) {
              assert.ok(~location.indexOf("http://"), "Wrong location!");
              done(null);
            });
          });
        });
      });
    });
  });
  describe("leaving", function() {
    it("closing browser", function(done) {
      this.timeout(TIMEOUT);
      browser.quit(function() {
        done(null);
      });
    });
  });


  describe("remote promises", function() {
    describe("remote", function() {
      it("should create browser", function() {
        browser = wd.promiseRemote(remoteWdConfig);
        should.exist(browser);
        if (!process.env.WD_COV) {
          browser.on("status", function(info) {
            return console.log("\u001b[36m%s\u001b[0m", info);
          });
          browser.on("command", function(meth, path) {
            return console.log(" > \u001b[33m%s\u001b[0m: %s", meth, path);
          });
        }
      });
    });
    describe("init", function() {
      it("should initialize browser", function() {
        this.timeout(TIMEOUT);
        return browser.init(desired).then(function() {
          sessionID = browser.sessionID;
        });
      });
    });
    describe("browsing", function() {
      describe("getting page", function() {
        it("should navigate to test page and check title", function() {
          this.timeout(TIMEOUT);
          return browser.get("http://admc.io/wd/test-pages/guinea-pig.html").then(function() {
            return browser.title();
          }).then(function(title) {
            return assert.ok(~title.indexOf("I am a page title - Sauce Labs"), "Wrong title!");
          });
        });
      });
      describe("clicking submit", function() {
        it("submit element should be clicked", function() {
          this.timeout(TIMEOUT);
          return browser.elementById("submit").then(function(el) {
            return browser.clickElement(el);
          }).then(function() {
            return browser["eval"]("window.location.href");
          }).then(function(location) {
            assert.ok(~location.indexOf("http://"), "Wrong location!");
          });
        });
      });
    });
    describe("leaving", function() {
      it("closing browser", function() {
        this.timeout(TIMEOUT);
        return browser.quit();
      });
    });
  });
};

exports.test = test;
