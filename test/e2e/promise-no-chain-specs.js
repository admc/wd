var testInfo = {
  name: "e2e promise no chain",
  tags: ['e2e']
};

var setup = require("../helpers/setup-promise-no-chain");

describe('promise no chain tests(' + setup.testEnv + ')', function() {
  var browser;
  var allPassed = true;

  before(function() {
    this.timeout(env.INIT_TIMEOUT);
    return setup.initBrowser(testInfo).then(function() {
      browser = setup.browser;
    });
  });

  beforeEach(function() {
    return browser.get("http://admc.io/wd/test-pages/guinea-pig.html");
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

  it("should retrieve the title", function() {
    return browser
      .title().should.eventually.include("I am a page title - Sauce Labs");
  });

  it("should retrieve a subelement value", function() {
    return browser.elementById('the_forms_id').then(function(el) {
        return el.elementById('unchecked_checkbox');
    }).then(function(el) {
        return el.getAttribute('type');
    }).should.become('checkbox');
  });

  it("clicking submit should work", function() {
    return browser.elementById("submit").then(function(el) {
      return browser.clickElement(el);
    }).then(function() {
      /* jshint evil: true */
      return browser.eval("window.location.href");
    }).should.eventually.include("http://");
  });

});

