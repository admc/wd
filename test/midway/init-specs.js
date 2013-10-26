function testInfo(testDesc) {
  return {
    name: "midway init " + testDesc ,
    tags: ['midway']
  };
}

var setup = require('../helpers/setup');

describe('browser. tests (' + setup.testEnv + ') @multi', function() {

  var browser;

  before(function() {
    browser = setup.remote();
  });

  afterEach(function() {
    return setup.closeBrowser();
  });

  afterEach(function() {
    return setup.jobStatus(this.currentTest.state === 'passed');
  });

  it("default should be firefox", function() {
    browser.defaultCapabilities.browserName.should.equal('firefox');
    browser.defaultCapabilities.javascriptEnabled.should.be.ok;
    return browser
      .init()
      .then(function() { return setup.jobUpdate(testInfo('#1')); })
      .sessionCapabilities().should.eventually.have.property('browserName', 'firefox');
  });

  it("setting browser default", function() {
    browser.defaultCapabilities.browserName = 'chrome';
    browser.defaultCapabilities.javascriptEnabled = false;
    return browser
      .init()
      .then(function() { return setup.jobUpdate(testInfo('#2')); })
      .sessionCapabilities().should.eventually.have.property('browserName', 'chrome');
  });

  it("desired browser as parameter", function() {
    browser.defaultCapabilities.browserName = 'firefox';
    return browser
      .init({browserName: 'chrome'})
      .then(function() { return setup.jobUpdate(testInfo('#3')); })
      .sessionCapabilities().should.eventually.have.property('browserName', 'chrome');
  });

  if(env.SAUCE){

    it("setting browser platform to VISTA @saucelabs", function() {
      browser.defaultCapabilities.platform = 'VISTA';
      browser.defaultCapabilities.browserName = 'firefox';

      return browser
        .init()
        .then(function() { return setup.jobUpdate(testInfo('#4')); })
        .sessionCapabilities().should.eventually.have.property('platform', 'XP');
    });

    it("setting browser platform to LINUX @saucelabs", function() {
      browser.defaultCapabilities.browserName = 'chrome';
      browser.defaultCapabilities.platform = 'LINUX';

      return browser
        .init()
        .then(function() { return setup.jobUpdate(testInfo('#5')); })
        .sessionCapabilities().should.eventually.have.property('platform', 'linux');
    });

    it("configuring explorer in desired @saucelabs", function() {
      // todo: clone setup desired and modify it
      var desired = {
        browserName: 'iexplore',
        platform: 'Windows 2008',
        name: 'browser init using desired',
        tags: ['wd', 'test'],
        "record-video": false
      };

      return browser
        .init(desired)
        .then(function() { return setup.jobUpdate(testInfo('#6')); })
        .sessionCapabilities().then(function(sessionCapabilities) {
          sessionCapabilities.platform.should.equal('WINDOWS');
          sessionCapabilities.browserName.should.include('explorer');
        });
    });
  }
});
