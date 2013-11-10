require('../helpers/setup');

describe('wait-for ' + env.ENV_DESC, function() {
  var asserters = wd.asserters;
  var page = '<div id="theDiv"></div>';

  var appendChild =
    'setTimeout(function() {\n' +
    ' $("#theDiv").append("<div class=\\"child\\">a waitFor child</div>");\n' +
    '}, arguments[0]);\n';

  var removeChildren =
    '$("#theDiv").empty();\n';

  var appendChildAndHide =
    '$("#theDiv").append("<div class=\\"child\\">a waitFor child</div>");\n' +
    'setTimeout(function() {\n' +
    ' $("#theDiv .child").hide();\n' +
    '}, arguments[0]);\n';

  var appendChildHideAndShow =
    '$("#theDiv").append("<div class=\\"child\\">a waitFor child</div>");\n' +
    '$("#theDiv .child").hide();\n' +
    'setTimeout(function() {\n' +
    ' $("#theDiv .child").show();\n' +
    '}, arguments[0]);\n';

  // util function used tag chai assertion errors
  var tagChaiAssertionError = function(err) {
    // throw error and tag as retriable to poll again
    err.retriable = err instanceof AssertionError;
    throw err;
  };

  var asserter = function(browser, cb) {
    browser.text(function(err, text) {
      if(err) { return cb(err); }
      cb( null, text.match(/a waitFor child/), "It worked!" );
    });
  };

 var promisedAsserter = function(browser) {
    return browser
      .text().then(function(text) {
        text.should.include('a waitFor child');
        return text;
      })
      .catch(tagChaiAssertionError);
  };

  var asserterFalse = function(browser, cb) {
    cb( null, false);
  };

  var elAsserter = function(el, cb) {
    el.text(function(err, text) {
      if(err) { return cb(err); }
        cb( null, text && text.length >0);
    });
  };

  var promisedElAsserter = function(el) {
    return el
      .text().should.eventually.have.length.above(0)
      .text()
      .catch(tagChaiAssertionError);
  };

  var elAsserterFalse = function(el, cb) {
    cb( null, false);
  };

  var ctx = require('./midway-base')(this),
      express = ctx.express,
      browser;
  ctx.browser.then(function(_browser) { browser = _browser; });

  express.partials['browser.waitFor'] = page;
  it('browser.waitFor', function() {
    return browser

      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .text().should.eventually.not.include('a waitFor child')
      .waitFor(asserter , 2 * env.BASE_TIME_UNIT, 100)
        .should.become("It worked!")
      .waitFor( { asserter: asserter, timeout: 2 * env.BASE_TIME_UNIT,
        pollFreq: 100 } )
      .waitFor( asserter , 2 * env.BASE_TIME_UNIT).should.become("It worked!")
      .waitFor( asserter ).should.become("It worked!")

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .waitFor( promisedAsserter , 2 * env.BASE_TIME_UNIT)
        .should.eventually.include('a waitFor child')

      .then(function() {
        return browser
          .execute( removeChildren )
          .execute( appendChild, [env.BASE_TIME_UNIT] )
          .waitFor( asserterFalse, 0.1 * env.BASE_TIME_UNIT, 100 )
          .should.be.rejectedWith(/Condition wasn't satisfied!/);
      });
  });

  express.partials['browser.waitForElement'] = page;
  it('browser.waitForElement', function() {
    return browser

      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElement("css selector", "#theDiv .child", 2 * env.BASE_TIME_UNIT, 100)
      .text().should.become('a waitFor child')
      .waitForElement("css selector", "#theDiv .child", 2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child')
      .waitForElement("css selector", "#theDiv .child")
      .text().should.become('a waitFor child')

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .waitForElement("css selector", "#theDiv .child", elAsserter, 2 * env.BASE_TIME_UNIT, 100)
      .text().should.become('a waitFor child')
      .waitForElement("css selector", "#theDiv .child", elAsserter, 2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child')
      .waitForElement("css selector", "#theDiv .child", elAsserter)
      .text().should.become('a waitFor child')

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .waitForElement("css selector", "#theDiv .child", { asserter: elAsserter,
        timeout: 2 * env.BASE_TIME_UNIT, pollFreq: 100 })
      .text().should.become('a waitFor child')
      .waitForElement("css selector", "#theDiv .child", {
        timeout: 2 * env.BASE_TIME_UNIT, pollFreq: 100 })
      .text().should.become('a waitFor child')

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElement("css selector", "#theDiv .child", promisedElAsserter,
         2 * env.BASE_TIME_UNIT, 100)
      .text().should.become('a waitFor child')

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )

      .then(function() {
        return browser
          .waitForElement("css selector", "#theDiv .child", elAsserterFalse,
            0.1 * env.BASE_TIME_UNIT, 100)
          .should.be.rejectedWith(/Element condition wasn't satisfied/);
      })

      .then(function() {
        return browser
          .waitForElement("css selector", "#theDiv .child", { asserter: elAsserterFalse,
            timeout: 0.1 * env.BASE_TIME_UNIT, pollFreq: 100 })
          .should.be.rejectedWith(/Element condition wasn't satisfied/);
      })

      .then(function() {
        return browser
          .waitForElement("css selector", "#wrongsel .child", 0.1 * env.BASE_TIME_UNIT)
          .should.be.rejectedWith(/Element condition wasn't satisfied/);
      });
  });

  express.partials['browser.waitForElementByCss'] = page;
  it('browser.waitForElementByCss', function() {
    return browser

      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElementByCss("#theDiv .child", 2 * env.BASE_TIME_UNIT, 100)
      .text().should.become('a waitFor child')

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", elAsserter, 2 * env.BASE_TIME_UNIT, 100)
      .text().should.become('a waitFor child')

      .execute( removeChildren )
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", { asserter: elAsserter,
        timeout: 2 * env.BASE_TIME_UNIT, pollFreq: 100 });
  });

  express.partials['asserters.nonEmptyText'] = page;
  it('asserters.nonEmptyText', function() {
    return browser
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElementByCss("#theDiv .child", asserters.nonEmptyText ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  express.partials['asserters.textInclude'] = page;
  it('asserters.textInclude', function() {
    return browser
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElementByCss("#theDiv .child", asserters.textInclude('a waitFor child') ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  express.partials['asserters.isVisible'] = page;
  it('asserters.isVisible', function() {
    return browser
      .execute( appendChildHideAndShow, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", asserters.isVisible ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  express.partials['asserters.isHidden'] = page;
  it('asserters.isHidden', function() {
    return browser
      .execute( appendChildAndHide, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", asserters.isHidden ,2 * env.BASE_TIME_UNIT)
      .text().should.become('');
  });

  express.partials['asserters.jsCondition'] =
    '<div id="theDiv"></div>\n';
  it('asserters.jsCondition', function() {
    var exprCond = "$('#theDiv .child').length > 0";
    return browser
      .executeAsync(
        'var args = Array.prototype.slice.call( arguments, 0 );\n' +
        'var done = args[args.length -1];\n' +
        ' setTimeout(function() {\n' +
        ' $("#theDiv").html("<div class=\\"child\\">a waitForCondition child</div>");\n' +
        ' }, arguments[0]);\n' +
        'done();\n',
        [env.BASE_TIME_UNIT]
      )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitFor(asserters.jsCondition(exprCond) , 2 * env.BASE_TIME_UNIT, 200)
        .should.eventually.be.ok
      .waitFor(asserters.jsCondition(exprCond, true) , 2 * env.BASE_TIME_UNIT, 200)
        .should.eventually.be.ok
      .then(function() {
        // unsafe mode might hangs selenium
        return browser.waitFor(asserters.jsCondition('$wrong expr!!!', true))
          .should.be.rejectedWith(/status: 13/);
      });
  });
});
