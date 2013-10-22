var testInfo = {
  name: "e2e basics",
  tags: ['e2e']
};

var setup = require("../helpers/setup");

describe('basic tests(' + setup.testEnv + ')', function() {

  var browser;
  var allPassed = true;

  before(function() {
    return browser = setup.initBrowser(testInfo);
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

  it("should retrieve the page title", function() {
    return browser
      .title().should.eventually.include("I am a page title - Sauce Labs");
  });

  it("submit element should be clicked", function() {
    /* jshint evil: true */
    return browser
      .elementById("submit")
      .click()
      .eval("window.location.href").should.eventually.include("http://");
  });

});


