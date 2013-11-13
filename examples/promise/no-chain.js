require('colors');
var chai = require("chai");
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

var browser = wd.promiseRemote();

// optional extra logging
//browser._debugPromise();
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

browser
  .init({ browserName: 'chrome' })
  .then(function () {
    return browser.get("http://admc.io/wd/test-pages/guinea-pig.html");
  })
  .then(function () { return browser.title();})
  .then(function (title) {
    title.should.equal('WD Tests');
    return browser.elementById('i am a link');
  })
  .then(function (el) { return browser.clickElement(el); })
  .then(function () {
    /* jshint evil: true */
    return browser.eval("window.location.href");
  })
  .then(function (href) { href.should.include('guinea-pig2'); })
  .fin(function () { return browser.quit(); })
  .done();
