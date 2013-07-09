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
      describe("url string", function() {
        it("browser should be initialized with: http url", function(done) {
          var browser;
          browser = wd.remote('http://localhost:8888/wd/hub');
          browser.configUrl.protocol.should.equal('http:');
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
        it("browser should be initialized with: https url", function(done) {
          var browser;
          browser = wd.remote('https://localhost:8888/wd/hub');
          browser.configUrl.protocol.should.equal('https:');
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
        it("browser should be initialized with: http url, auth", function(done) {
          var browser;
          browser = wd.remote('http://mickey:mouse@localhost:8888/wd/hub');
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          browser.configUrl.auth.should.equal('mickey:mouse');
          done(null);
        });
      });
      describe("url object", function() {
        it("browser should be initialized with: http url", function(done) {
          var browser;
          browser = wd.remote(url.parse('http://localhost:8888/wd/hub'));
          browser.configUrl.protocol.should.equal('http:');
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
        it("browser should be initialized with: https url", function(done) {
          var browser;
          browser = wd.remote(url.parse('https://localhost:8888/wd/hub'));
          browser.configUrl.protocol.should.equal('https:');
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
        it("browser should be initialized with: http url, auth", function(done) {
          var browser;
          browser = wd.remote(url.parse('http://mickey:mouse@localhost:8888/wd/hub'));
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          browser.configUrl.auth.should.equal('mickey:mouse');
          done(null);
        });
      });
      describe("params", function() {
        it("browser should be initialized with: host, port", function(done) {
          var browser;
          browser = wd.remote('localhost', 8888);
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          should.not.exist(browser.configUrl.auth);
          done(null);
        });
        it("browser should be initialized with: host, port, user, pwd", function(done) {
          var browser;
          browser = wd.remote('localhost', '8888', 'mickey', 'mouse');
          browser.configUrl.hostname.should.equal('localhost');
          browser.configUrl.port.should.equal('8888');
          browser.configUrl.pathname.should.equal('/wd/hub');
          browser.configUrl.auth.should.equal('mickey:mouse');
          done(null);
        });
      });
    });
    describe("options", function() {
      it("browser should be initialized with default", function(done) {
        var browser;
        browser = wd.remote({});
        browser.configUrl.hostname.should.equal('127.0.0.1');
        browser.configUrl.port.should.equal('4444');
        browser.configUrl.pathname.should.equal('/wd/hub');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: hostname, port", function(done) {
        var browser;
        browser = wd.remote({
          hostname: 'localhost',
          port: 8888
        });
        browser.configUrl.protocol.should.equal('http:');
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: protocol, hostname, port", function(done) {
        var browser;
        browser = wd.remote({
          protocol: 'https:',
          hostname: 'localhost',
          port: '8888'
        });
        browser.configUrl.protocol.should.equal('https:');
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: host", function(done) {
        var browser;
        browser = wd.remote({
          host: 'localhost:8888',
        });
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: hostname, port, user, pwd", function(done) {
        var browser;
        browser = wd.remote({
          hostname: 'localhost',
          port: 8888,
          user: 'mickey',
          pwd: 'mouse'
        });
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        browser.configUrl.auth.should.equal('mickey:mouse');
        done(null);
      });
      it("browser should be initialized with: hostname, port, user, pwd", function(done) {
        var browser;
        browser = wd.remote({
          hostname: 'localhost',
          port: 8888,
          auth: 'mickey:mouse',
        });
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        browser.configUrl.auth.should.equal('mickey:mouse');
        done(null);
      });
      it("browser should be initialized with: path", function(done) {
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
      it("browser should be initialized with: hostname, port, path", function(done) {
        var browser;
        browser = wd.remote({
          hostname: 'localhost',
          port: 8888,
          path: '/'
        });
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: hostname, port, username, user, pwd", function(done) {
        var browser;
        browser = wd.remote({
          hostname: 'localhost',
          port: 8888,
          user: 'mickey',
          pwd: 'mouse',
          path: '/asia/taiwan'
        });
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/asia/taiwan');
        browser.configUrl.auth.should.equal('mickey:mouse');
        done(null);
      });
    });
    describe("automatic Saucelabs config", function() {
      before(function() {
        process.env.SAUCE_USERNAME = 'zorro'
        process.env.SAUCE_ACCESS_KEY = '1234-5678'
      });
      after(function() {
        delete process.env.SAUCE_USERNAME;
        delete process.env.SAUCE_ACCESS_KEY;
      });
      it("browser should be initialized with indexed parameters", function(done) {
        var browser;
        browser = wd.remote('ondemand.saucelabs.com', 80);
        browser.configUrl.hostname.should.equal('ondemand.saucelabs.com');
        browser.configUrl.port.should.equal('80');
        browser.configUrl.pathname.should.equal('/wd/hub');
        browser.configUrl.auth.should.equal('zorro:1234-5678');
        done();
      });
      it("browser should be initialized with named parameters", function(done) {
        var browser;
        browser = wd.remote({
          hostname: 'ondemand.saucelabs.com', 
          port:80 });
        browser.configUrl.hostname.should.equal('ondemand.saucelabs.com');
        browser.configUrl.port.should.equal('80');
        browser.configUrl.pathname.should.equal('/wd/hub');
        browser.configUrl.auth.should.equal('zorro:1234-5678');
        done();
      });
      it("browser should be initialized with url string", function(done) {
        var browser;
        browser = wd.remote('http://ondemand.saucelabs.com/wd/hub');
        browser.configUrl.hostname.should.equal('ondemand.saucelabs.com');
        (browser.configUrl.port || '80').should.equal('80');
        browser.configUrl.pathname.should.equal('/wd/hub');
        browser.configUrl.auth.should.equal('zorro:1234-5678');
        done();
      });
      it("browser should be initialized with url object", function(done) {
        var browser;
        browser = wd.remote(url.parse('http://ondemand.saucelabs.com/wd/hub'));
        browser.configUrl.hostname.should.equal('ondemand.saucelabs.com');
        (browser.configUrl.port || '80').should.equal('80');
        browser.configUrl.pathname.should.equal('/wd/hub');
        browser.configUrl.auth.should.equal('zorro:1234-5678');
        done();
      });
    });
    describe("backward compatibility", function() {
      it("browser should be initialized with: host, port", function(done) {
        var browser;
        browser = wd.remote({
          host: 'localhost',
          port: 8888
        });
        browser.configUrl.protocol.should.equal('http:');
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: https, host, port", function(done) {
        var browser;
        browser = wd.remote({
          https: true,
          host: 'localhost',
          port: 8888
        });
        browser.configUrl.protocol.should.equal('https:');
        browser.configUrl.hostname.should.equal('localhost');
        browser.configUrl.port.should.equal('8888');
        browser.configUrl.pathname.should.equal('/wd/hub');
        should.not.exist(browser.configUrl.auth);
        done(null);
      });
      it("browser should be initialized with: host, port, username, accesskey", function(done) {
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
  });
});
