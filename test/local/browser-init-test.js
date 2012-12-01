/*global describe,before,it,after */
var should, wd;

should = require('should');

wd = require('../common/wd-with-cov');

describe("wd", function() {
  describe("local", function() {
    describe("browser init tests", function() {
      describe("default init", function() {
        it("should open firefox browser", function(done) {
          var browser;
          this.timeout(15000);
          browser = wd.remote();
          browser.defaultCapabilities.should.eql({
            browserName: 'firefox',
            version: '',
            javascriptEnabled: true,
            platform: 'ANY'
          });
          browser.init(function(err) {
            should.not.exist(err);
            browser.sessionCapabilities(function(err, capabilities) {
              should.not.exist(err);
              capabilities.browserName.should.equal('firefox');
              browser.quit(function(err) {
                should.not.exist(err);
                done(null);
              });
            });
          });
        });
      });
      describe("browser.defaultCapabilities", function() {
        it("should open chrome browser", function(done) {
          var browser;
          this.timeout(15000);
          browser = wd.remote();
          browser.defaultCapabilities.browserName = 'chrome';
          browser.defaultCapabilities.javascriptEnabled = false;
          browser.defaultCapabilities.should.eql({
            browserName: 'chrome',
            version: '',
            javascriptEnabled: false,
            platform: 'ANY'
          });
          browser.init(function(err) {
            should.not.exist(err);
            browser.sessionCapabilities(function(err, capabilities) {
              should.not.exist(err);
              capabilities.browserName.should.equal('chrome');
              browser.quit(function(err) {
                should.not.exist(err);
                done(null);
              });
            });
          });
        });
      });
      describe("desired only", function() {
        it("should open chrome browser", function(done) {
          var browser;
          this.timeout(15000);
          browser = wd.remote();
          browser.defaultCapabilities.should.eql({
            browserName: 'firefox',
            version: '',
            javascriptEnabled: true,
            platform: 'ANY'
          });
          browser.init({
            browserName: 'chrome'
          }, function(err) {
            should.not.exist(err);
            browser.sessionCapabilities(function(err, capabilities) {
              should.not.exist(err);
              capabilities.browserName.should.equal('chrome');
              browser.quit(function(err) {
                should.not.exist(err);
                done(null);
              });
            });
          });
        });
      });
      describe("desired overiding defaultCapabilities", function() {
        it("should open firefox browser", function(done) {
          var browser;
          this.timeout(15000);
          browser = wd.remote();
          browser.defaultCapabilities.browserName = 'chrome';
          browser.defaultCapabilities.should.eql({
            browserName: 'chrome',
            version: '',
            javascriptEnabled: true,
            platform: 'ANY'
          });
          browser.init({
            browserName: 'firefox'
          }, function(err) {
            should.not.exist(err);
            browser.sessionCapabilities(function(err, capabilities) {
              should.not.exist(err);
              capabilities.browserName.should.equal('firefox');
              browser.quit(function(err) {
                should.not.exist(err);
                done(null);
              });
            });
          });
        });
      });
    });
  });
});
