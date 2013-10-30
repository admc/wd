require('../helpers/setup');

describe('api-exec ' + env.ENV_DESC, function() {

  var ctx = require('./midway-base')(this),
      express = ctx.express,
      browser;
  ctx.browser.then(function(_browser) { browser = _browser; });

  express.partials['browser.eval'] =
    '<div id="eval"><ul><li>line 1</li><li>line 2</li></ul></div>';
  it('browser.eval', function() {
    /* jshint evil: true */
    return browser
      .eval('1+2').should.become(3)
      .eval('document.title').should.eventually.include("WD Tests")
      .eval('$("#eval").length').should.become(1)
      .eval('$("#eval li").length').should.become(2);
  });

  express.partials['browser.safeEval'] =
    '<div id="eval"><ul><li>line 1</li><li>line 2</li></ul></div>';
  it('browser.safeEval', function() {
    /* jshint evil: true */
    return browser
      .safeEval('1+2').should.become(3)
      .safeEval('document.title').should.eventually.include("WD Tests")
      .safeEval('$("#eval").length').should.become(1)
      .safeEval('$("#eval li").length').should.become(2)
      .then(function() {
        return browser
          .safeEval('invalid-code> here').should.be.rejectedWith(/status: 13/);
      });
  });

  it('browser.execute', function() {
    /* jshint evil: true */
    var jsScript =
      'var a = arguments[0], b = arguments[1];\n' +
      'window.wd_sync_execute_test = \'It worked! \' + (a+b)';

    return browser
      // without args
      .execute('window.wd_sync_execute_test = "It worked!"')
      .eval('window.wd_sync_execute_test').should.become('It worked!')
      // with args
      .execute(jsScript, [6, 4])
      .eval('window.wd_sync_execute_test').should.become('It worked! 10');
  });

  it('browser.safeExecute', function() {
    /* jshint evil: true */
    var jsScript =
      'var a = arguments[0], b = arguments[1];\n' +
      'window.wd_sync_execute_test = \'It worked! \' + (a+b)';
    return browser
      .safeExecute('window.wd_sync_execute_test = "It worked!"')
      .eval('window.wd_sync_execute_test').should.become('It worked!')
      .then(function() {
        return browser
          .safeExecute('invalid-code> here').should.be.rejectedWith(/status: 13/);
      })
      .safeExecute(jsScript, [6, 4])
      .eval('window.wd_sync_execute_test').should.become('It worked! 10')
      .then(function() {
        return browser
          .safeExecute('invalid-code> here', [6, 4]).should.be.rejectedWith(/status: 13/);
      });
  });

  it('browser.executeAsync', function() {
    var jsScript =
      'var args = Array.prototype.slice.call( arguments, 0 );\n' +
      'var done = args[args.length -1];\n' +
      'done("OK");';
    var jsScriptWithArgs =
      'var args = Array.prototype.slice.call( arguments, 0 );\n' +
      'var done = args[args.length -1];\n' +
      'done("OK " + (args[0] + args[1]));';
    return browser
      .executeAsync(jsScript).should.become('OK')
      .executeAsync(jsScriptWithArgs, [10, 5]).should.become('OK 15');
  });

  it('browser.safeExecuteAsync', function() {
    var jsScript =
      'var args = Array.prototype.slice.call( arguments, 0 );\n' +
      'var done = args[args.length -1];\n' +
      'done("OK");';
    var jsScriptWithArgs =
      'var args = Array.prototype.slice.call( arguments, 0 );\n' +
      'var done = args[args.length -1];\n' +
      'done("OK " + (args[0] + args[1]));';
      browser
        .safeExecuteAsync(jsScript).should.become('OK')
        .then(function() {
          return browser.safeExecuteAsync('123 invalid<script')
            .should.be.rejectedWith(/status: 13/);
      })
        .safeExecuteAsync(jsScriptWithArgs, [10, 5]).should.become('OK 15')
        .then(function() {
          return browser.safeExecuteAsync('123 invalid<script', [10, 5])
            .should.be.rejectedWith(/status: 13/);
      });
  });

  it('browser.setAsyncScriptTimeout', function() {
    var jsScript =
      'var args = Array.prototype.slice.call( arguments, 0 );\n' +
      'var done = args[args.length -1];\n' +
      'setTimeout(function() {\n' +
        'done("OK");\n' +
      '}, arguments[0]);';
    return browser
      .setAsyncScriptTimeout( env.BASE_TIME_UNIT/2 )
      .executeAsync( jsScript, [env.BASE_TIME_UNIT]).should.be.rejectedWith(/status\: 28/)
      .setAsyncScriptTimeout( 2* env.BASE_TIME_UNIT )
      .executeAsync( jsScript, [env.BASE_TIME_UNIT])
      .setAsyncScriptTimeout(0);
  });


  express.partials['browser.waitForCondition'] =
    '<div id="theDiv"></div>\n';
  it('browser.waitForCondition', function() {
    var exprCond = "$('#theDiv .child').length > 0";
    return browser
      .execute(
        ' setTimeout(function() {\n' +
        ' $("#theDiv").html("<div class=\\"child\\">a waitForCondition child</div>");\n' +
        ' }, arguments[0]);\n' //+
        ,
        [env.BASE_TIME_UNIT]
      )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .waitForCondition(exprCond, 2 * env.BASE_TIME_UNIT, 200).should.eventually.be.ok
      .waitForCondition(exprCond, 2 * env.BASE_TIME_UNIT).should.eventually.be.ok
      .waitForCondition(exprCond).should.eventually.be.ok
      .then(function() {
        return browser.waitForCondition('$wrong expr!!!').should.be.rejectedWith(/status: 13/);
      });
  });

  express.partials['browser.waitForConditionInBrowser'] =
    '<div id="theDiv"></div>\n';
  it('browser.waitForConditionInBrowser', function() {
    var exprCond = "$('#theDiv .child').length > 0";
    return browser
      .execute(
        ' setTimeout(function() {\n' +
        ' $("#theDiv").html("<div class=\\"child\\">a waitForCondition child</div>");\n' +
        ' }, arguments[0]);\n' //+
        ,
        [env.BASE_TIME_UNIT]
      )
      .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
      .setAsyncScriptTimeout(5 * env.BASE_TIME_UNIT)
      .waitForConditionInBrowser(exprCond, 2 * env.BASE_TIME_UNIT, 0.2 * env.BASE_TIME_UNIT)
        .should.eventually.be.ok
      .waitForConditionInBrowser(exprCond, 2 * env.BASE_TIME_UNIT)
        .should.eventually.be.ok
      .waitForConditionInBrowser(exprCond).should.eventually.be.ok
      .then(function() {
        return browser.waitForConditionInBrowser("totally #} wrong == expr")
          .should.be.rejectedWith(/status: 13/);
      })
      .setAsyncScriptTimeout(0);
  });

});
