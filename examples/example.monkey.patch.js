var wd;
try {
  wd = require('wd');
} catch( err ) { 
  wd = require('../lib/main');
}
var assert = require('assert');

// monkey patching
wd.webdriver.prototype.elementByCssSelectorWhenReady = function(selector, timeout, cb) {
  var _this = this;
  this.waitForElementByCssSelector(selector, timeout, function() {
    _this.elementByCssSelector(selector, cb);
  });
};

var browser = wd.remote();

browser.on('status', function(info){
  console.log('\x1b[36m%s\x1b[0m', info);
});

browser.on('command', function(meth, path, data){
  console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
});

browser.init({
    browserName:'chrome'
    , tags : ["examples"]
    , name: "This is an example test"
  }, function() {
  browser.get("http://admc.io/wd/test-pages/guinea-pig.html", function() {
    browser.title(function(err, title) {
      assert.ok(~title.indexOf('I am a page title - Sauce Labs'), 'Wrong title!');
      browser.elementByCssSelectorWhenReady('#your_comments', 500, function(err, el) {      
        assert(el != null);
        browser.quit();
      });
    });
  });
});

