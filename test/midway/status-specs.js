var setup = require('../helpers/setup');

describe('status method tests(' + setup.testEnv + ')', function() {
  var browser;

  before(function() {
    return browser = setup.initBrowser();
  });

  after(function() {
    return setup.closeBrowser();
  });

  it("browser.status", function() {
    return browser.status().should.eventually.exist;
  });

  it("browser.sessions", function() {
    return browser.sessions().should.eventually.exist;
  });

  it("browser.sessionCapabilities", function() {
    return browser.sessionCapabilities().then(function(capabilities) {
      should.exist(capabilities);
      should.exist(capabilities.browserName);
      should.exist(capabilities.platform);
    });
  });

  it("browser.altSessionCapabilities", function() {
    return browser.altSessionCapabilities().then(function(capabilities) {
      should.exist(capabilities);
      should.exist(capabilities.browserName);
      should.exist(capabilities.platform);
    });
  });

});
