require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

// Monkey patching need to be implemented before creating the browser.
// Right now monkey patched methods need to be asynchronous,
// even for promise. Better alternative is in being worked on.
wd.webdriver.prototype.elementByCssSelectorWhenReady = function(selector, timeout/*, cb*/) {
  // 'wd.findCallback' is a small helper which looks for the callback in a safe way, and avoids
  // hanging when the number of arguments passed is wrong.
  // There is also a 'wd.varargs' for methods with variable argument number.
  var cb = wd.findCallback(arguments);

  var _this = this;
  this.waitForElementByCssSelector(selector, timeout, function() {
    _this.elementByCssSelector(selector, cb);
  });
};

var browser = wd.promiseChainRemote();

// optional extra logging
//browser._debugPromise();
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

/* jshint evil: true */
browser
  .init({browserName:'chrome'})
  .get("http://admc.io/wd/test-pages/guinea-pig.html")
  .title()
    .should.become('I am a page title - Sauce Labs')
  .elementByCssSelectorWhenReady('#your_comments', 2000)
    .should.eventually.exist
  .fin(function() { return browser.quit(); })
  .done();



