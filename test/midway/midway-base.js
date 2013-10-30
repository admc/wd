/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

module.exports = function(that) {

  that.timeout(env.TIMEOUT);

  var deferred = Q.defer();

  var browser;
  var allPassed = true;
  var express = new Express( __dirname + '/assets' );

  before(function() {
    express.start();
    browser = wd.promiseChainRemote(env.REMOTE_CONFIG);
    deferred.resolve(browser);
    var sauceExtra = {
      name: sauceJobTitle(this.runnable().parent.title),
      tags: ['midway']
    };
    return browser
      .configureLogging()
      .init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null ));
  });

  beforeEach(function() {
    return browser.get( midwayUrl(
      this.currentTest.parent.title,
      this.currentTest.title));
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
  });

  after(function() {
    express.stop();
    return browser
      .quit().then(function() {
        if(env.SAUCE) { return(browser.sauceJobStatus(allPassed)); }
      });
  });

  return {
    express: express,
    browser: deferred.promise
  };
};
