var base = require("./setup-base");

module.exports = _.extend({
  remote: function() {
    this.browser = wd
      .remote();
    return this.browser;
  },
  initBrowser: function(cb) {
    this.browser = wd
      .remote();
    base.configureLogging();
    this.browser.init(base.desired, cb);
    return this.browser;
  },
  closeBrowser: function(cb) {
    this.browser.quit(cb);
  }
}, base);
