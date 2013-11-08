require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// js to add and remove a child div
var appendChild =
  'setTimeout(function() {\n' +
  ' $("#i_am_an_id").append("<div class=\\"child\\">a waitFor child</div>");\n' +
  '}, arguments[0]);\n';

var removeChildren =
  ' $("#i_am_an_id").empty();\n';

// simple asserter, just checking the element (or browser) text is non-empty.
// It will be called until the promise is resolve with a defined value.
var textNonEmpty = function(target) { // browser or el
  return target
    .text().should.eventually.have.length.above(0)
    // el will be returned by waitFor no matter what,
    // but always return something when positive
    .thenResolve("OK")
    .catch(function() {}); // error catching here
};

// another simple element asserter
var isVisible = function(el) {
  return el
    .isVisible().should.eventually.be.ok
    // el will be returned by waitFor no matter what,
    // but always return something when positive
    .thenResolve(true)
    .catch(function() {}); // error catching here
};

// asserter generator
var textInclude = function(text) {
  // It will be called until the promise is resolve with a defined value.
  return function(target) { // browser or el
    return target
      .text().should.eventually.include(text)
      // value will be returned by waitFor
      // always return something when positive
      .thenResolve("OK")
      .catch(function(/*err*/) {}); // error catching here

  };
};

// optional monkey patching
wd.PromiseChainWebdriver.prototype.waitForElementWithTextByCss = function(selector, timeout, pollFreq) {
  return this
    .waitForElementByCss(selector, textNonEmpty , timeout, pollFreq);
};

var browser = wd.promiseChainRemote();

browser
  .init({browserName:'chrome'})
  .get("http://admc.io/wd/test-pages/guinea-pig.html")
  .title().should.become('WD Tests')

  // generic waitFor, asserter compulsary
  .execute(removeChildren)
  .execute( appendChild, [500] )
  .waitFor(textInclude('a waitFor child') , 2000)
  .should.become("OK")

  // waitForElement without asserter
  .execute(removeChildren)
  .execute( appendChild, [500] )
  .waitForElementByCss("#i_am_an_id .child" , 2000)
  .text().should.become('a waitFor child')

  // waitForElement with element asserter
  .execute(removeChildren)
  .execute( appendChild, [500] )
  .waitForElementByCss("#i_am_an_id .child", textNonEmpty , 2000)
  .text().should.become('a waitFor child')

  // trying isVisible asserter
  .waitForElementByCss("#i_am_an_id .child", isVisible , 2000)
  .text().should.become('a waitFor child')

  // monkey patched method
  .execute(removeChildren)
  .execute( appendChild, [500] )
  .waitForElementWithTextByCss("#i_am_an_id .child", 2000)
  .text().should.become('a waitFor child')

  .fin(function() { return browser.quit(); })
  .done();
