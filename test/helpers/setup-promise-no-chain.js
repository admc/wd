var base = require("./setup-base");

module.exports = _.extend({
  initBrowser: function(testInfo) {
    this.browser = wd
      .promiseRemote(base.remoteConfig);
    base.configureLogging(this.browser);
    return this.browser.init(base.desiredWithTestInfo(testInfo));
  },
  jobStatus: function(passed) {
    return this.browser
      .getSessionId().then(function(sessionId) {
        return base._jobStatus(passed ,sessionId);
      });
  },
  closeBrowser: function() {
    return this.browser.quit();
  }
}, base);
