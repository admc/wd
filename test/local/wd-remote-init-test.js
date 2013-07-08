/*global describe,before,it,after */
var should = require('should'),
    url = require('url'),
    wd = require('../common/wd-with-cov'),
    _ = require('underscore');

process.env = _(process.env).omit('SAUCE_USERNAME', 'SAUCE_ACCESS_KEY');

describe("wd", function() {
  describe("local", function() {
    describe("wd remote tests", function() {
      describe("default", function() {
        it("browser should be initialized with default parameters", function(done) {
          var browser;
          browser = wd.remote();
          browser.configUrl.hostname.should.equal('127.0.0.1');
          browser.configUrl.port.should.equal('4444');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done();
        });
      });
      describe("params", function() {
        describe("host, port", function() {
          it("browser should be initialized with given parameters", function(done) {
            var browser;
            browser = wd.remote('localhost', 8888);
            browser.configUrl.hostname.should.equal('localhost');
            browser.configUrl.port.should.equal('8888');
            browser.configUrl.pathname.should.equal('/wd/hub');
            should.not.exist(browser.configUrl.auth);
            done(null);
          });
          it("browser should be initialized with given parameters (url string)", function(done) {
            var browser;
            browser = wd.remote('http://localhost:8888/wd/hub');
            browser.configUrl.hostname.should.equal('localhost');
            browser.configUrl.port.should.equal('8888');
            browser.configUrl.pathname.should.equal('/wd/hub');
            should.not.exist(browser.configUrl.auth);
            done(null);
          });
          it("browser should be initialized with given parameters (url object)", function(done) {
            var browser;
            browser = wd.remote(url.parse('http://localhost:8888/wd/hub'));
            browser.configUrl.hostname.should.equal('localhost');
            browser.configUrl.port.should.equal('8888');
            browser.configUrl.pathname.should.equal('/wd/hub');
            should.not.exist(browser.configUrl.auth);
            done(null);
          });
        });
        describe("host, port, username, accesskey", function() {
          it("browser should be initialized with given parameters", function(done) {
            var browser;
            browser = wd.remote('localhost', 8888, 'mickey', 'mouse');
            browser.configUrl.hostname.should.equal('localhost');
            browser.configUrl.port.should.equal('8888');
            browser.configUrl.pathname.should.equal('/wd/hub');
            browser.configUrl.auth.should.equal('mickey:mouse');
            done(null);
          });
          it("browser should be initialized with given parameters (url string)", function(done) {
            var browser;
            browser = wd.remote('http://mickey:mouse@localhost:8888/wd/hub');
            browser.configUrl.hostname.should.equal('localhost');
            browser.configUrl.port.should.equal('8888');
            browser.configUrl.pathname.should.equal('/wd/hub');
            browser.configUrl.auth.should.equal('mickey:mouse');
            done(null);
          });
          it("browser should be initialized with given parameters (url object)", function(done) {
            var browser;
            browser = wd.remote(url.parse('http://mickey:mouse@localhost:8888/wd/hub'));
            browser.configUrl.hostname.should.equal('localhost');
            browser.configUrl.port.should.equal('8888');
            browser.configUrl.pathname.should.equal('/wd/hub');
            browser.configUrl.auth.should.equal('mickey:mouse');
            done(null);
          });
        });
      });
    });
    describe("options", function() {
      describe("empty options", function() {
        it("browser should be initialized with default", function(done) {
          var browser;
          browser = wd.remote({});
          browser.configUrl.hostname.should.equal('127.0.0.1');
          browser.configUrl.port.should.equal('4444');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
      });
      describe("host, port", function() {
        it("browser should be initialized with given options", function(done) {
          var browser;
          browser = wd.remote({
            host: 'localhost',
            port: 8888
          });
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
      });
      describe("host, port, username, accesskey", function() {
        it("browser should be initialized with given options", function(done) {
          var browser;
          browser = wd.remote({
            host: 'localhost',
            port: 8888,
            username: 'mickey',
            accessKey: 'mouse'
          });
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          browser.configUrl.auth.should.equal('mickey:mouse');
          done(null);
        });
      });
      describe("path", function() {
        it("browser should be initialized with given options", function(done) {
          var browser;
          browser = wd.remote({
            path: '/taiwan'
          });
          browser.configUrl.hostname.should.equal('127.0.0.1');
          browser.configUrl.port.should.equal('4444');
          browser.configUrl.pathname.should.equal('/taiwan');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
      });
      describe("host, port, path", function() {
        it("browser should be initialized with given options", function(done) {
          var browser;
          browser = wd.remote({
            host: 'localhost',
            port: 8888,
            path: '/'
          });
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
      });
      describe("host, port, username, accesskey, path", function() {
        it("browser should be initialized with given options", function(done) {
          var browser;
          browser = wd.remote({
            host: 'localhost',
            port: 8888,
            username: 'mickey',
            accessKey: 'mouse',
            path: '/asia/taiwan'
          });
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/asia/taiwan');
          browser.configUrl.auth.should.equal('mickey:mouse');
          done(null);
        });
      });
    });
  });
});
