var base = require("./setup-base");

module.exports = _.extend({
  initBrowser: function() {
    this.browser = wd
      .promiseChainRemote();
    base.configureLogging();
    return this.browser.init(base.desired);
  },
  closeBrowser: function() {
    return this.browser
      //.sleep(2000)
      .quit();
  }
}, base);
