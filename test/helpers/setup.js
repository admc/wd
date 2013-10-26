var base = require("./setup-base");

module.exports = _.extend({
  remote: function() {
    this.browser = wd
      .promiseChainRemote(base.remoteConfig);
    base.configureLogging();
    return this.browser;
  },
  initBrowser: function(testInfo) {
    this.browser = wd
      .promiseChainRemote(base.remoteConfig);
    base.configureLogging(this.browser);
    return this.browser
      .init(base.desiredWithTestInfo(testInfo))
      .printError();
  },
  jobStatus: function(passed) {
    return this.browser
      .getSessionId().then(function(sessionId) {
        return base._jobStatus(passed ,sessionId);
      });
  },
  jobUpdate: function(passed) {
    return this.browser
      .getSessionId().then(function(sessionId) {
        return base._jobUpdate(passed ,sessionId);
      });
  },
  closeBrowser: function() {
    return this.browser
      //.sleep(2000)
      .quit();
  }
}, base);
