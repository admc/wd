var webdriver = require("../lib/main")

var browser = webdriver.remote("ondemand.saucelabs.com", 80, "username", "accesskey");
browser.init(function() {
  browser.get("http://www.jelly.io", function() {
    browser.eval("window.location.href", function(a, o) {
      console.log(o);
      browser.get("http://www.seleniumhq.org", function() {
        browser.close(function() {
          browser.quit()
        })
      })
    })
  })
})
