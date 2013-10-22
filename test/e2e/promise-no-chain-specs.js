
var setup = require("../helpers/setup-promise-no-chain");

describe('promise no chain tests(' + setup.testEnv + ')', function() {
  var browser;

  before(function() {
    return setup.initBrowser().then(function() {
      browser = setup.browser;
    });
  });

  after(function() {
    return setup.closeBrowser();
  });

  beforeEach(function() {
    return browser.get("http://admc.io/wd/test-pages/guinea-pig.html");
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
    browser.elementById("submit").then(function(el) {
      return browser.clickElement(el);
    }).then(function() {
      /* jshint evil: true */
      return browser.eval("window.location.href");
    }).should.eventually.include("http://");
  });

});

