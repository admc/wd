/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

module.exports = function(that, partials) {

  that.timeout(env.TIMEOUT);

  var deferred = Q.defer();

  var browser;
  var allPassed = true;
  var express;
  before(function(done) {
    express = new Express( __dirname + '/assets', partials );
    express.start(done);
  });

  before(function() {
    browser = wd.promiseChainRemote(env.REMOTE_CONFIG);
    deferred.resolve(browser);
    var sauceExtra = {
      name: sauceJobTitle(this.runnable().parent.title),
      tags: ['midway']
    };
    var desired = mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null );
    return browser
      .configureLogging()
      .then(function() {
        return browser
          .init(desired)
          .catch(function() {
            // trying one more time
            return browser.init(desired);
          });
      });
  });

  beforeEach(function() {
    var url = midwayUrl(
      this.currentTest.parent.title,
      this.currentTest.title
    );
    return browser
    .get(url)
    .title().should.eventually.include("WD Tests")
    .catch(function() {
      // trying one more time
      return browser
        .get(url)
        .title().should.eventually.include("WD Tests");
    });
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
  });

  after(function() {
    return browser
      .quit().then(function() {
        if(env.SAUCE) { return(browser.sauceJobStatus(allPassed)); }
      });
  });

  after(function(done) {
    express.stop(done);
  });

  return deferred.promise;
};
