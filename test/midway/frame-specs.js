/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

require('../helpers/setup');

describe('frame ' + env.ENV_DESC + ' @skip-android @skip-ios', function() {
  this.timeout(env.TIMEOUT);

  var browser;
  var allPassed = true;
  var express = new Express( __dirname + '/assets' );

  before(function() {
    express.start();
    browser = wd.promiseChainRemote(env.REMOTE_CONFIG);
    var sauceExtra = {
      name: sauceJobTitle(this.runnable().parent.title),
      tags: ['midway']
    };
    return browser
      .configureLogging()
      .init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null ));
  });

  beforeEach(function() {

    return browser
      .windowHandles().should.eventually.have.length.below(2)
      .get( midwayUrl(
        this.currentTest.parent.title,
        this.currentTest.title) + "&window_num=1" ).printError();
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
    return browser
      .windowHandles().then(function(handles) {
        var seq = [];
        _(handles).each(function(handle, i) {
          if(i>0) {
            seq.push(function() { return browser.window(handle).close(); });
          }
        });
        if(handles.length > 0) {
          seq.push(function() {return browser.window(handles[0]);});
        }
        return seq.reduce(Q.when, new Q());
      });
  });

  after(function() {
    express.stop();
    return browser
      .quit().then(function() {
        if(env.SAUCE) { return(browser.sauceJobStatus(allPassed)); }
      });
  });

  it('browser.frame', function() {
    return browser
      .get( env.MIDWAY_ROOT_URL + "/frame-test/index.html")
      .elementsByTagName('frame').should.eventually.have.length(3)
      .frame(0)
      .elementsByTagName('body').text().should.eventually.include("Menu!")
      .frame()
      .elementsByTagName('frame').then(function(frames) {
        frames.should.have.length(3);
        return browser
          .frame(frames[1])
          .elementsByTagName('body').text().should.eventually.include("Welcome!");
      })
      .frame()
      .elementsByTagName('frame').then(function(frames) {
        return browser.getAttribute(frames[2],'id').then(function(id) {
          browser
            .frame(id)
            .elementsByTagName('body').text().should.eventually.include("Banner!");
        });
      });
  });

});
