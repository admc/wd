/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

require('../helpers/setup');

var imageinfo = require('imageinfo');

describe('api-various ' + env.ENV_DESC, function() {
  this.timeout(env.TIMEOUT);

  var browser;
  var allPassed = true;
  var express = new Express( __dirname + '/assets' );

  before(function() {
    express.start();
    browser = wd.promiseChainRemote(env.REMOTE_CONFIG);
    var sauceExtra = {
      name: sauceJobTitle(this.runnable().parent.title),
      tags: ['midway']
    };
    return browser
      .configureLogging()
      .init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null ));
  });

  beforeEach(function() {
    return browser.get( midwayUrl(
      this.currentTest.parent.title,
      this.currentTest.title));
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
  });

  after(function() {
    express.stop();
    return browser
      .quit().then(function() {
        if(env.SAUCE) { return(browser.sauceJobStatus(allPassed)); }
      });
  });

  express.partials['browser.getLocation'] =
    '<div id="theDiv">I\'ve got a location</div>\n';
  it('browser.getLocation', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .getLocation(el).then(function(location) {
            should.exist(location.x);
            should.exist(location.y);
          });
      })
      .elementByCss("#theDiv").getLocation().then(function(location) {
        should.exist(location.x);
        should.exist(location.y);
      });
  });

  express.partials['browser.getLocationInView'] =
    '<div id="theDiv">I\'ve got a location</div>\n';
  it('browser.getLocationInView', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .getLocationInView(el).then(function(location) {
            should.exist(location.x);
            should.exist(location.y);
          });
      })
      .elementByCss("#theDiv").getLocationInView().then(function(location) {
        should.exist(location.x);
        should.exist(location.y);
      });
  });

  express.partials['browser.getSize'] =
    '<div id="theDiv">I\'ve got a good size!</div>\n';
  it('browser.getSize', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .getSize(el).then(function(size) {
            should.exist(size.width);
            should.exist(size.height);
          });
      })
      .elementByCss("#theDiv").getSize().then(function(size) {
        should.exist(size.width);
        should.exist(size.height);
      });
  });

  express.partials['browser.acceptAlert'] =
    '<div id="theDiv"><a>click me</a></div>\n';
  it('browser.acceptAlert', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a = $(\'#theDiv a\');\n' +
        ' a.click(function() {\n' +
        '   alert("coffee is running out");\n' +
        '   return false;\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss("#theDiv a").click()
      .acceptAlert();
  });

  express.partials['browser.dismissAlert'] =
    '<div id="theDiv"><a>click me</a></div>\n';
  it('browser.dismissAlert @skip-chrome', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a = $(\'#theDiv a\');\n' +
        ' a.click(function() {\n' +
        '   alert("coffee is running out");\n' +
        '   return false;\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss("#theDiv a").click()
      .dismissAlert();
  });

  it('browser.takeScreenshot', function() {
    return browser
      .takeScreenshot().then(function(res) {
        var data = new Buffer(res, 'base64');
        var img = imageinfo(data);
        img.should.not.be.false;
        img.format.should.equal('PNG');
        img.width.should.not.equal(0);
        img.height.should.not.equal(0);
      });
  });

  it('browser.<cookie methods>', function() {
    return browser
      .deleteAllCookies()
      .allCookies().should.eventually.deep.equal([])
      .setCookie({
        name: 'fruit1',
        value: 'apple'
      })
      .allCookies().then(function(res) {
        res.should.have.length(1);
        res.filter(function(c) {
          return c.name === 'fruit1' && c.value === 'apple';
        }).should.have.length(1);
      })
      .setCookie({
        name: 'fruit2',
        value: 'pear'
      })
      .allCookies().then(function(res) {
        res.should.have.length(2);
        res.filter(function(c) {
          return c.name === 'fruit1' && c.value === 'apple';
        }).should.have.length(1);
      })
      .setCookie({
        name: 'fruit3',
        value: 'orange'
      })
      .allCookies().should.eventually.have.length(3)
      .deleteCookie('fruit2')
      .allCookies().then(function(res) {
        res.should.have.length(2);
        res.filter(function(c) {
          return c.name === 'fruit2' && c.value === 'pear';
        }).should.have.length(0);
      })
      .deleteAllCookies()
      .allCookies().should.eventually.deep.equal([])
      // not sure how to test this
      .setCookie({
        name: 'fruit3',
        value: 'orange',
        secure: true
      })
      .deleteAllCookies();
  });

  it('browser.<localStorage methods>', function() {
    return browser
      .setLocalStorageKey('foo', 'bar')
      .getLocalStorageKey('foo').should.become('bar')
      .setLocalStorageKey("bar", "ham")
      .removeLocalStorageKey("bar")
      .getLocalStorageKey("bar").should.eventually.be.a('null')
      .setLocalStorageKey("ham", "foo")
      .clearLocalStorage()
      .getLocalStorageKey("ham").should.eventually.be.a('null');
  });

  it('browser.uploadFile', function() {
    return browser
      .uploadFile("test/mocha.opts").should.eventually.include('mocha.opts')
      .uploadFile("test/midway/assets/tux.jpg").should.eventually.include('tux.jpg');
  });

  it('err.inspect', function() {
    return browser
      .safeExecute("invalid-code> here").then(
        function() { assert(false); },
        function(err) {
          should.exist(err);
          (err instanceof Error).should.be.true;
          (err.inspect().length <= 510).should.be.true;
        }
      );
  });

});
