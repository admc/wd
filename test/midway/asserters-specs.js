require('../helpers/setup');

describe('asserters ' + env.ENV_DESC, function() {
  var asserters = wd.asserters;
  var page = '<div id="theDiv"></div>';

  var appendChild =
    'setTimeout(function() {\n' +
    ' $("#theDiv").append("<div class=\\"child\\">a waitFor child</div>");\n' +
    '}, arguments[0]);\n';

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

  var appendChildHideAndShowTheDiv =
    '$("#theDiv").append("<div class=\\"child\\">a waitFor child</div>");\n' +
    '$("#theDiv").hide();\n' +
    'setTimeout(function() {\n' +
    ' $("#theDiv").show();\n' +
    '}, arguments[0]);\n';

  var appendChildAndHideTheDiv =
    '$("#theDiv").append("<div class=\\"child\\">a waitFor child</div>");\n' +
    'setTimeout(function() {\n' +
    ' $("#theDiv").hide();\n' +
    '}, arguments[0]);\n';

  var partials = {};

  var browser;
  require('./midway-base')(this, partials).then(function(_browser) { browser = _browser; });

  partials['asserters.nonEmptyText'] = page;
  it('asserters.nonEmptyText', function() {
    return browser
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElementByCss("#theDiv .child", asserters.nonEmptyText ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  partials['asserters.textInclude'] = page;
  it('asserters.textInclude', function() {
    return browser
      .execute( appendChild, [env.BASE_TIME_UNIT] )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForElementByCss("#theDiv .child", asserters.textInclude('a waitFor child') ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  partials['asserters.isVisible'] = page;
  it('asserters.isVisible', function() {
    return browser
      .execute( appendChildHideAndShow, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", asserters.isVisible ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  partials['asserters.isVisible when parentNode is hide and show'] = page;
  it('asserters.isVisible when parentNode is hide and show', function() {
    return browser
      .execute( appendChildHideAndShowTheDiv, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", asserters.isVisible ,2 * env.BASE_TIME_UNIT)
      .text().should.become('a waitFor child');
  });

  partials['asserters.isHidden'] = page;
  it('asserters.isHidden', function() {
    return browser
      .execute( appendChildAndHide, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", asserters.isHidden ,2 * env.BASE_TIME_UNIT)
      .text().should.become('');
  });

  partials['asserters.isHidden when parentNode is hide'] = page;
  it('asserters.isHidden when parentNode is hide', function() {
    return browser
      .execute( appendChildAndHideTheDiv, [env.BASE_TIME_UNIT] )
      .waitForElementByCss("#theDiv .child", asserters.isHidden ,2 * env.BASE_TIME_UNIT)
      .text().should.become('');
  });

  partials['asserters.jsCondition'] =
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
