var wd = require("../lib/main")

var browser = wd.createWebDriver("ondemand.saucelabs.com", 80, "username", "accesskey");
browser.init(function() {
  browser.get("http://www.jelly.io", function() {
    browser.exec("window.location.href", function(o) {
      console.log(o);
      browser.get("http://www.seleniumhq.org", function() {
        browser.close(function() {
          browser.quit()
        })
      })
    })
  })
})