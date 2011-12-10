var webdriver = require("../lib/main")

var browser = webdriver.remote();
browser.init({browserName:"firefox"}, function() {
  browser.get("http://www.jelly.io", function() {
    browser.eval("window.location.href", function(a, o) {
      console.log(o);
      browser.get("http://www.seleniumhq.org", function() {
        browser.quit(function() {
          console.log("DONE");
        })
      })
    })
  })
})
