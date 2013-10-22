var base = require("./setup-base");

module.exports = _.extend({
  initBrowser: function() {
    this.browser = wd
      .promiseRemote();
    base.configureLogging();
    return this.browser.init(base.desired);
  },
  closeBrowser: function() {
    return this.browser.quit();
  }
}, base);
