var setup = require("../helpers/setup");

describe('promise chain tests(' + setup.testEnv + ')', function() {

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

  it("should retrieve title", function() {
    return browser
      .title().should.eventually.contain("I am a page title - Sauce Labs");
  });

 it("should retrieve title a subelement value", function() {
    return browser
      .elementById('the_forms_id')
      .elementById('>', 'unchecked_checkbox').then(function(el) {
        return Q.all([
          el.click().click().getAttribute('type').should.become('checkbox'),
          el.getAttribute('type').should.become('checkbox')
        ]);
      });
  });

  it("sendKeys should work", function() {
    var el = browser
      .elementById('the_forms_id')
      .elementById('>', 'unchecked_checkbox');
      return el.sendKeys('X');
  });

   it("clicking submit should work", function() {
    /* jshint evil: true */
    return browser
      .elementById("submit")
      .click()
      .eval("window.location.href")
      .should.eventually.contain("http://");
  });

});
