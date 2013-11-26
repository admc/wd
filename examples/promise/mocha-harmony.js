// requires node 0.11
// run with: mocha --harmony examples/promise/mocha-harmony.js

/* global describe, it, before , beforeEach, after*/
/* jshint moz: true, evil: true */

require("mocha-as-promised")();

require('colors');
var chai = require("chai");
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

var Q = wd.Q;

describe("mocha with generators", function() {
  this.timeout(10000);
  var browser;

  before(Q.async(function *() {
    browser = wd.promiseChainRemote();
    //browser._debugPromise();
    browser.on('status', function(info) {
      console.log(info);
    });
    browser.on('command', function(meth, path, data) {
      console.log(' > ' + meth, path, data || '');
    });
    yield browser.init({browserName:'chrome'});
  }));

  beforeEach(Q.async(function*() {
    yield browser.get("http://admc.io/wd/test-pages/guinea-pig.html");
  }));

  after(Q.async(function*() {
    yield browser.quit();
  }));

  it("should retrieve the page title", Q.async(function *() {
    var title = yield browser.title();
    title.should.equal("WD Tests");
  }));

  it("submit element should be clicked", Q.async(function *() {
    var submitEl = yield browser.elementById("submit");
    yield submitEl.click();
    var location = yield browser.eval("window.location.href");
    location.should.include("&submit");
  }));

});

