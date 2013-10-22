var setup = require("../helpers/setup");

describe('basic tests(' + setup.testEnv + ')', function() {

  var browser;

  before(function() {
    return browser = setup.initBrowser();
  });

  after(function() {
    return setup.closeBrowser();
  });

  beforeEach(function() {
    return browser.get("http://admc.io/wd/test-pages/guinea-pig.html");
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


