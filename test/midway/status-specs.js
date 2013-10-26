var testInfo = {
  name: "midway status",
  tags: ['midway']
};

var setup = require('../helpers/setup');

describe('status method tests(' + setup.testEnv + ') @multi', function() {
  var browser;
  var allPassed = true;

  before(function() {
    this.timeout(env.INIT_TIMEOUT);
    return browser = setup.initBrowser(testInfo);
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
  });

  after(function() {
    return setup.closeBrowser();
  });

  after(function() {
    return setup.jobStatus(allPassed);
  });

  it("browser.status", function() {
    return browser.status().should.eventually.exist;
  });

  if(!env.SAUCE) { // this cannot work in a cloud env
    it("browser.sessions", function() {
      return browser.sessions().should.eventually.exist;
    });
  }

  it("browser.sessionCapabilities", function() {
    return browser.sessionCapabilities().then(function(capabilities) {
      should.exist(capabilities);
      should.exist(capabilities.browserName);
      should.exist(capabilities.platform);
    });
  });

  if(!env.SAUCE) { // it relies on browser.sessions
    it("browser.altSessionCapabilities", function() {
      return browser.altSessionCapabilities().then(function(capabilities) {
        should.exist(capabilities);
        should.exist(capabilities.browserName);
        should.exist(capabilities.platform);
      });
    });
  }
});
