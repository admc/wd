var base = require("./setup-base");

module.exports = _.extend({
  remote: function() {
    this.browser = wd
      .remote(base.remoteConfig);
    return this.browser;
  },
  initBrowser: function(testInfo, cb) {
    if(typeof testInfo === 'function') {cb = testInfo;}
    this.browser = wd
      .remote(base.remoteConfig);
    base.configureLogging(this.browser);
    this.browser.init(base.desiredWithTestInfo(testInfo), cb);
    return this.browser;
  },
  jobStatus: function(passed, cb) {
    base._jobStatus(passed ,this.browser.getSessionId()).then(
      function() {cb();},
      function(err) {cb(err);}
    );
  },
  closeBrowser: function(cb) {
    this.browser.quit(cb);
  }
}, base);
