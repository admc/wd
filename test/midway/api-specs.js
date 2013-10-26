var testInfo = {
  name: "midway api",
  tags: ['midway']
};

var setup = require('../helpers/setup');

var imageinfo = require('imageinfo');

var TIMEOUT_BASE = setup.TIMEOUT_BASE;

describe('api test (' + setup.testEnv + ')', function() {

  var browser;
  var allPassed = true;
  var express = new setup.Express( __dirname + '/assets' );

  before(function() {
    this.timeout(env.INIT_TIMEOUT);
    express.start();
    return browser = setup.initBrowser(testInfo);
  });

  beforeEach(function() {
    var cleanTitle = this.currentTest.title.replace(/@[-\w]+/g, '').trim();
    return browser.get(
      env.MIDWAY_ROOT_URL + '/test-page?partial=' +
        encodeURIComponent(cleanTitle));
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
  });

  after(function() {
    express.stop();
    return setup.closeBrowser();
  });

  after(function() {
    return setup.jobStatus(allPassed);
  });

  if(!env.SAUCE){ // page timeout seems to be disabled in sauce
    it('browser.setPageLoadTimeout', function() {
      var defaultTimeout = (setup.desired && (setup.desired.browserName === 'firefox'))? -1 : TIMEOUT_BASE;
      return browser
        .setPageLoadTimeout(TIMEOUT_BASE / 2)
        .setPageLoadTimeout(TIMEOUT_BASE / 2)
        .get( env.MIDWAY_ROOT_URL + '/test-page')
        .setPageLoadTimeout(defaultTimeout);
    });
  }

  it('browser.refresh', function() {
    return browser.refresh();
  });

  it('back/forward', function() {
    return browser
      .get( env.MIDWAY_ROOT_URL +  '/test-page?p=2')
      .url().should.eventually.include("?p=2")
      .back()
      .url().should.eventually.not.include("?p=2")
      .forward()
      .url().should.eventually.include("?p=2");
  });

  express.partials['browser.element'] =
    '<div name="theDiv">Hello World!</div>';
  it('browser.element', function() {
    return browser
      .element("name", "theDiv").should.eventually.exist
      .element("name", "theDiv2").should.be.rejected.with(/status: 7/);
  });

  express.partials['browser.elementOrNull'] =
    '<div name="theDiv">Hello World!</div>';
  it('browser.elementOrNull', function() {
    return browser
      .elementOrNull("name", "theDiv").should.eventually.exist
      .elementOrNull("name", "theDiv2").should.eventually.be.a('null');
  });

  express.partials['browser.elementIfExists'] =
    '<div name="theDiv">Hello World!</div>';
  it('browser.elementIfExists', function() {
    return browser
      .elementIfExists("name", "theDiv").should.eventually.exist
      .elementIfExists("name", "theDiv2").should.eventually.be.a('undefined');
  });

  express.partials['browser.hasElement'] =
    '<div name="theDiv">Hello World!</div>';
  it('browser.hasElement', function() {
    return browser
      .hasElement("name", "theDiv").should.eventually.be.ok
      .hasElement("name", "theDiv2").should.eventually.not.be.ok;
  });

  express.partials['browser.waitForElement'] =
    '<div id="theDiv"></div>';
  it('browser.waitForElement', function() {
    return browser
      .execute(
        'setTimeout(function() {\n' +
        ' $("#theDiv").append("<div class=\\"child\\">a waitForElement child</div>");\n' +
        '}, arguments[0]);\n',
        [0.75 * TIMEOUT_BASE]
      )
      .elementByCss("#theDiv .child").should.be.rejected.with(/status: 7/)
      .waitForElement("css selector", "#theDiv .child", 2 * TIMEOUT_BASE)
        .should.be.fulfilled
      .waitForElement("css selector", "#wrongsel .child", 2 * TIMEOUT_BASE)
        .should.be.rejected;
  });

  express.partials['browser.waitForVisible'] =
    '<div id="theDiv"></div>';
  it('browser.waitForVisible', function() {
    return browser
      .execute(
        '$("#theDiv").append("<div class=\\"child\\">a waitForVisible child</div>");\n' +
        '$("#theDiv .child").hide();\n' +
        'setTimeout(function() {\n' +
        ' $("#theDiv .child").show();\n' +
        '}, arguments[0]);\n',
        [0.75 * TIMEOUT_BASE]
      )
      .elementByCss("#theDiv .child").should.eventually.exist
      .waitForVisible("css selector", "#theDiv .child", 2 * TIMEOUT_BASE)
        .should.be.fulfilled
      .waitForVisible("css selector", "#wrongsel .child", 2 * TIMEOUT_BASE)
        .should.be.rejected;
  });

  express.partials['browser.elements'] =
    '<div>\n' +
    '  <div name="elementsByName">Hello World!</div>\n' +
    '  <div name="elementsByName">Hello World!</div>\n' +
    '  <div name="elementsByName">Hello World!</div>\n' +
    '</div>\n';
  it('browser.elements', function() {
    return browser
      .sleep(5)
      .elements("name", "elementsByName").should.eventually.have.length(3)
      //.elements("name", "elementsByName2").should.eventually.deep.equal([])
      .sleep(5)
      .printError();
  });

  // get suffix specific fields
  function getSuffixFields(suffix) {
    var elementFuncName = 'element' + suffix;
    var searchOne = elementFuncName;
    if (searchOne.match(/ByLinkText/)) {
      searchOne = "click " + searchOne;
    }
    if (searchOne.match(/ByCss/)) {
      searchOne = "." + searchOne;
    }
    if (searchOne.match(/ByXPath/)) {
      searchOne = "//div[@id='elementByXPath']/input";
    }
    if (searchOne.match(/ByTagName/)) {
      searchOne = "span";
    }
    var searchOneInvalid = searchOne + '2';
    if (searchOne.match(/ByXPath/)) {
      searchOneInvalid = "//div[@id='elementByXPath2']/input";
    }
    if (searchOne.match(/ByTagName/)) {
      searchOneInvalid = "span2";
    }
    var searchSeveral = searchOne.replace('element', 'elements');
    var searchSeveralInvalid = searchOneInvalid.replace('element', 'elements');

    var waitForElementFuncName = 'waitForElement' + suffix;
    var childHtml = "<div class='child child_" + waitForElementFuncName + "'>a " + waitForElementFuncName + " child</div>";
    if (suffix.match(/ById/)) {
      childHtml = "<div class='child' id='child_" + waitForElementFuncName + "'>a " + waitForElementFuncName + " child</div>";
    }
    if (suffix.match(/ByName/)) {
      childHtml = "<div class='child' name='child_" + waitForElementFuncName + "'>a " + waitForElementFuncName + " child</div>";
    }
    if (suffix.match(/ByLinkText/)) {
      childHtml = "<a class='child'>child_" + waitForElementFuncName + "</a>";
    }
    if (suffix.match(/ByPartialLinkText/)) {
      childHtml = "<a class='child'>hello child_" + waitForElementFuncName + "</a>";
    }
    if (suffix.match(/ByTagName/)) {
      childHtml = "<hr class='child'>";
    }
    var searchChild = "child_" + waitForElementFuncName;
    if (suffix.match(/ByCss/)) {
      searchChild = "." + searchChild;
    }
    if (suffix.match(/ByTagName/)) {
      searchChild = "hr";
    }
    if (suffix.match(/ByXPath/)) {
      searchChild = "//div[@class='child child_" + waitForElementFuncName + "']";
    }
    return {
      searchOne: searchOne,
      searchOneInvalid: searchOneInvalid,
      searchSeveral: searchSeveral,
      searchSeveralInvalid: searchSeveralInvalid,
      childHtml: childHtml,
      searchChild: searchChild
    };
  }

  var allElementsPartial =
      '<div>\n' +
      '  <div class="elementByClassName">Hello World!</div>\n' +
      '  <div class="elementByCssSelector">Hello World!</div>\n' +
      '  <div id="elementById">Hello World!</div>\n' +
      '  <div name="elementByName">Hello World!</div>\n' +
      '  <div id="elementByLinkText"><a>click elementByLinkText</a></div>\n' +
      '  <div id="elementByPartialLinkText"><a>click elementByPartialLinkText</a></div>\n' +
      '  <div id="elementByTagName"><span>Hello World!</span></div>\n' +
      '  <div id="elementByXPath"/><input></div>\n' +
      '  <div class="elementByCss">Hello World!</div>\n' +
      '<div>\n';

  var suffixes =
    ['ByClassName', 'ByCssSelector', 'ById', 'ByName', 'ByLinkText',
    'ByPartialLinkText', 'ByTagName', 'ByXPath', 'ByCss'];
  _(suffixes).each(function(suffix) {
    var suffixFields = getSuffixFields(suffix);

    var elementFuncName = 'element' + suffix;
    express.partials['browser.' + elementFuncName] = allElementsPartial;
    it('browser.' + elementFuncName, function() {
      return browser
        [elementFuncName](suffixFields.searchOne).should.eventually.exist
        [elementFuncName](suffixFields.searchOneInvalid).should.be.rejected.with(/status: 7/);
    });

    var elementFuncNameOrNull = 'element' + suffix + 'OrNull';
    express.partials['browser.' + elementFuncNameOrNull] = allElementsPartial;
    it('browser.' + elementFuncNameOrNull, function() {
      return browser
        [elementFuncNameOrNull](suffixFields.searchOne).should.eventually.exist
        [elementFuncNameOrNull](suffixFields.searchOneInvalid).should.eventually.be.a('null');
    });

    var elementFuncNameIfExists = 'element' + suffix + 'IfExists';
    express.partials['browser.' + elementFuncNameIfExists] = allElementsPartial;
    it('browser.' + elementFuncNameIfExists, function() {
      return browser
        [elementFuncNameIfExists](suffixFields.searchOne).should.eventually.exist
        [elementFuncNameIfExists](suffixFields.searchOneInvalid).should.eventually.be.a('undefined');
    });

    var hasElementFuncName = 'hasElement' + suffix;
    express.partials['browser.' + hasElementFuncName] = allElementsPartial;
    it('browser.' + hasElementFuncName, function() {
      return browser
        [hasElementFuncName](suffixFields.searchOne).should.eventually.be.ok
        [hasElementFuncName](suffixFields.searchOneInvalid).should.eventually.not.be.ok;
    });

    var waitForElementFuncName = 'waitForElement' + suffix;
    express.partials['browser.' + waitForElementFuncName] =
      '<div id="theDiv"></div>';
    it('browser.' + waitForElementFuncName, function() {
      return browser
        .execute(
          'var args = Array.prototype.slice.call( arguments, 0 );\n' +
          'setTimeout(function() {\n' +
          ' $("#theDiv").append(args[0]);\n' +
          '}, args[1]);\n',
          [suffixFields.childHtml, 0.75 * TIMEOUT_BASE]
        )
        [elementFuncName](suffixFields.searchChild).should.be.rejected.with(/status: 7/)
        [waitForElementFuncName](suffixFields.searchChild, 2 * TIMEOUT_BASE)
          .should.be.fulfilled
        [waitForElementFuncName]("__wrongsel", 2 * TIMEOUT_BASE)
          .should.be.rejected;
    });

    var waitForVisibleFuncName = 'waitForVisible' + suffix;
    express.partials['browser.' + waitForVisibleFuncName] =
      '<div id="theDiv"></div>';
    it('browser.' + waitForVisibleFuncName, function() {
      return browser
        .execute(
          'var args = Array.prototype.slice.call( arguments, 0 );\n' +
          '$("#theDiv").append(args[0]);\n' +
          '$("#theDiv .child").hide();\n' +
          'setTimeout(function() {\n' +
          ' $("#theDiv .child").show();\n' +
          '}, args[1]);\n',
          [suffixFields.childHtml, 0.75 * TIMEOUT_BASE]
        )
        [elementFuncName](suffixFields.searchChild).should.eventually.exist
        [waitForVisibleFuncName](suffixFields.searchChild, 2 * TIMEOUT_BASE)
          .should.be.fulfilled
        [waitForVisibleFuncName]("__wrongsel", 2 * TIMEOUT_BASE)
          .should.be.rejected;
    });

    var elementsFuncName = 'elements' + suffix;
    express.partials['browser.' + elementsFuncName] =
      '<div>\n' +
      '  <div class="elementsByClassName">Hello World!</div>\n' +
      '  <div class="elementsByClassName">Hello World!</div>\n' +
      '  <div class="elementsByClassName">Hello World!</div>\n' +
      '</div>\n' +
      '<div>\n' +
      '  <div class="elementsByCssSelector">Hello World!</div>\n' +
      '  <div class="elementsByCssSelector">Hello World!</div>\n' +
      '  <div class="elementsByCssSelector">Hello World!</div>\n' +
      '</div>\n' +
      '<div>\n' +
      '  <div id="elementsById">Hello World!</div>\n' +
      '</div>\n' +
      '<div>\n' +
      '  <div name="elementsByName">Hello World!</div>\n' +
      '  <div name="elementsByName">Hello World!</div>\n' +
      '  <div name="elementsByName">Hello World!</div>\n' +
      '</div>\n' +
      '<div>\n' +
      '  <div class="elementsByLinkText"><a>click elementsByLinkText</a></div>\n' +
      '  <div class="elementsByLinkText"><a>click elementsByLinkText</a></div>\n' +
      '  <div class="elementsByLinkText"><a>click elementsByLinkText</a></div>\n' +
      '</div>\n' +
      '<div>\n' +
      '  <div class="elementsByPartialLinkText"><a>click elementsByPartialLinkText</a></div>\n' +
      '  <div class="elementsByPartialLinkText"><a>click elementsByPartialLinkText</a></div>\n' +
      '  <div class="elementsByPartialLinkText"><a>click elementsByPartialLinkText</a></div>\n' +
      '</div>\n' +
      '<div id="elementsByTagName">\n' +
      '  <span>Hello World!</span>\n' +
      '  <span>Hello World!</span>\n' +
      '  <span>Hello World!</span>\n' +
      '</div>\n' +
      '<div id="elementsByXPath"/>\n' +
      '  <input>\n' +
      '  <input>\n' +
      '  <input>\n' +
      '</div>\n' +
      '<div>\n' +
      '  <div class="elementsByCss">Hello World!</div>\n' +
      '  <div class="elementsByCss">Hello World!</div>\n' +
      '  <div class="elementsByCss">Hello World!</div>\n' +
      '</div>\n';

    it('browser.' + elementsFuncName, function() {
      return browser
        [elementsFuncName](suffixFields.searchSeveral).then(function(res) {
          if (elementsFuncName.match(/ById/)) {
            res.should.have.length(1);
          } else if (elementsFuncName.match(/ByTagName/)) {
            (res.length > 1).should.be.true;
          } else {
            res.should.have.length(3);
          }
        })
        [elementsFuncName](suffixFields.searchSeveralInvalid)
          .should.eventually.deep.equal([]);
    });

  }); // suffix loop ends

  express.partials['browser.eval'] =
    '<div id="eval"><ul><li>line 1</li><li>line 2</li></ul></div>';
  it('browser.eval', function() {
    /* jshint evil: true */
    return browser
      .eval('1+2').should.become(3)
      .eval('document.title').should.become("WD Tests")
      .eval('$("#eval").length').should.become(1)
      .eval('$("#eval li").length').should.become(2);
  });

  express.partials['browser.safeEval'] =
    '<div id="eval"><ul><li>line 1</li><li>line 2</li></ul></div>';
  it('browser.safeEval', function() {
    /* jshint evil: true */
    return browser
      .safeEval('1+2').should.become(3)
      .safeEval('document.title').should.become("WD Tests")
      .safeEval('$("#eval").length').should.become(1)
      .safeEval('$("#eval li").length').should.become(2)
      .safeEval('invalid-code> here').should.be.rejected.with(Error);
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
      // without args
      .safeExecute('window.wd_sync_execute_test = "It worked!"')
      .eval('window.wd_sync_execute_test').should.become('It worked!')
      .safeExecute('invalid-code> here').should.be.rejected.with(Error)
      // with args
      .safeExecute(jsScript, [6, 4])
      .eval('window.wd_sync_execute_test').should.become('It worked! 10')
      .safeExecute('invalid-code> here', [6, 4]).should.be.rejected.with(Error);
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
    return browser
      .safeExecuteAsync(jsScript).should.become('OK')
      .safeExecuteAsync('123 invalid<script').should.be.rejected.with(Error)
      .safeExecuteAsync(jsScriptWithArgs, [10, 5]).should.become('OK 15')
      .safeExecuteAsync('123 invalid<script', [10, 5]).should.be.rejected.with(Error);
  });

  express.partials['browser.setImplicitWaitTimeout'] =
    '<div id="setWaitTimeout"></div>';
  it('browser.setImplicitWaitTimeout', function() {
    return browser
      // return error 7 when timeout set to 0
      .setImplicitWaitTimeout(0)
      .execute(
        'setTimeout(function() {\n' +
        '$("#setWaitTimeout").html("<div class=\\"child\\">a child</div>");\n' +
        '}, arguments[0]);', [TIMEOUT_BASE])
      .elementByCss('#setWaitTimeout .child').should.be.rejected.with(/status\: 7/)
      .setImplicitWaitTimeout(2 * TIMEOUT_BASE)
      .elementByCss('#setWaitTimeout .child')
      .setImplicitWaitTimeout(0);
  });

  it('browser.setAsyncScriptTimeout', function() {
    var jsScript =
      'var args = Array.prototype.slice.call( arguments, 0 );\n' +
      'var done = args[args.length -1];\n' +
      'setTimeout(function() {\n' +
        'done("OK");\n' +
      '}, arguments[0]);';
    return browser
      .setAsyncScriptTimeout( TIMEOUT_BASE/2 )
      .executeAsync( jsScript, [TIMEOUT_BASE]).should.be.rejected.with(/status\: 28/)
      .setAsyncScriptTimeout( 2* TIMEOUT_BASE )
      .executeAsync( jsScript, [TIMEOUT_BASE])
      .setAsyncScriptTimeout(0);
  });

  express.partials['browser.getAttribute'] =
    '<div id="weatherDiv" weather="sunny">Hi</div>';
  it('browser.getAttribute', function() {
    return browser
      .elementById('weatherDiv').then(function(div) {
        return browser
          .getAttribute(div, 'weather').should.become("sunny")
          .getAttribute(div, 'timezone').should.eventually.be.a('null');
      })
      .elementById('weatherDiv').getAttribute('weather').should.become("sunny");
  });

  express.partials['browser.getTagName'] =
    '<div id="theDiv"><input type="text"><a href="#">a1</a></div>';
  it('browser.getTagName', function() {
    return browser
      .elementByCss('#theDiv input').then(function(el) {
        return browser.getTagName(el).should.become("input");
      })
      .elementByCss('#theDiv a').getTagName().should.become("a");
  });

  express.partials['browser.getValue'] =
    '<div id="theDiv">\n' +
    '  <input class="input-text" type="text" value="Hello getValueTest!">\n'  +
    '  <textarea>Hello getValueTest2!</textarea>\n' +
    '</div>';
  it('browser.getValue', function() {
    return browser
      .elementByCss('#theDiv input').then(function(el) {
        return browser.getValue(el).should.become('Hello getValueTest!');
      })
      .elementByCss('#theDiv input').getValue().should.become('Hello getValueTest!')
      .elementByCss('#theDiv textarea').then(function(el) {
        return browser.getValue(el).should.become('Hello getValueTest2!');
      })
      .elementByCss('#theDiv textarea').getValue().should.become('Hello getValueTest2!');
  });

  express.partials['browser.isDisplayed'] =
    '<div id="theDiv">\n' +
    '  <input class="displayed" type="text" value="Hello">\n' +
    '  <input class="hidden" type="hidden" value="Hello">\n' +
    '</div>\n';
  it('browser.isDisplayed', function() {
    return browser
      .elementByCss('#theDiv .displayed').then(function(el) {
        return browser.isDisplayed(el).should.eventually.be.ok;
      })
      .elementByCss('#theDiv .hidden').then(function(el) {
        return browser.isDisplayed(el).should.eventually.not.be.ok;
      })
      .elementByCss('#theDiv .displayed').isDisplayed().should.eventually.be.ok
      .elementByCss('#theDiv .hidden').isDisplayed().should.eventually.not.be.ok;
  });

  express.partials['browser.isEnabled'] =
    '<div id="theDiv">\n' +
    '  <input class="enabled" type="text" value="Hello">\n' +
    '  <input class="disabled" type="text" value="Hello" disabled>\n' +
    '</div>\n';
  it('browser.isEnabled', function() {
    return browser
      .elementByCss('#theDiv .enabled').then(function(el) {
        return browser.isEnabled(el).should.eventually.be.ok;
      })
      .elementByCss('#theDiv .disabled').then(function(el) {
        return browser.isEnabled(el).should.eventually.not.be.ok;
      })
      .elementByCss('#theDiv .enabled').isEnabled().should.eventually.be.ok
      .elementByCss('#theDiv .disabled').isEnabled().should.eventually.not.be.ok;
  });

  express.partials['browser.getComputedCss'] =
    '<div id="theDiv">\n' +
    '  <a href="#">a1</a>\n' +
    '</div>\n';
  it('browser.getComputedCss', function() {
    return browser
      .elementByCss('#theDiv a').then(function(el) {
        return browser
          .getComputedCss(el, 'color').should.eventually.match(/rgb/);
      }).elementByCss('#theDiv  a').getComputedCss('color')
        .should.eventually.match(/rgba/);
  });

  express.partials['browser.clickElement'] =
    '<div id="theDiv"><a href="#">not clicked</a></div>\n';
  it('browser.clickElement', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a = $(\'#theDiv a\');\n' +
        ' a.click(function() {\n' +
        '   a.html(\'clicked\');\n' +
        '   return false;\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss("#theDiv a").then(function(el) {
        return browser
          .text(el).should.become("not clicked")
          .clickElement(el)
          .text(el).should.become("clicked")
          ;
      });
  });

  express.partials['browser.moveTo'] =
    '<div id="theDiv">\n' +
    '  <a class="a1" href="#">a1</a><br>\n' +
    '  <a class="a2" href="#">a2</a><br>\n' +
    '  <div class="current"></div>\n' +
    '</div>\n';
  it('browser.moveTo', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a1 = $(\'#theDiv .a1\');\n' +
        ' a2 = $(\'#theDiv .a2\');\n' +
        ' current = $(\'#theDiv .current\');\n' +
        ' a1.hover(function() {\n' +
        '   current.html(\'a1\');\n' +
        ' });\n' +
        ' a2.hover(function() {\n' +
        '   current.html(\'a2\');\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss('#theDiv .current').text().should.become('')
      .elementByCss('#theDiv .a1').then(function(a1) {
        return browser
          .moveTo(a1)
          .elementByCss('#theDiv .current').text().should.become('a1');
      })
      .elementByCss('#theDiv .a2').then(function(a2) {
        return browser
          .moveTo(a2)
          .elementByCss('#theDiv .current').text().should.become('a2');
      })
       .elementByCss('#theDiv .a1').then(function(a1) {
        return browser
          .moveTo(a1)
          .elementByCss('#theDiv .current').text().should.become('a1');
      });
     // todo: add moveTo to element
  });

  express.partials['browser.buttonDown/browser.buttonUp'] =
    '<div id="theDiv"><a>hold me</a><div class="res"></div></div>\n';
  it('browser.buttonDown/browser.buttonUp', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a = $(\'#theDiv a\');\n' +
        ' res = $(\'#theDiv .res\');\n' +
        ' current = $(\'#theDiv .current\');\n' +
        ' a.mousedown(function() {\n' +
        '   res.html(\'button down\');\n' +
        ' });\n' +
        ' a.mouseup(function() {\n' +
        '   res.html(\'button up\');\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss('#theDiv .res').text().should.become('')
      .elementByCss('#theDiv a').then(function(el) {
        return browser
          .moveTo(el)
          .buttonDown()
          .elementByCss('#theDiv .res').text().should.become('button down')
          .buttonUp()
          .elementByCss('#theDiv .res').text().should.become('button up')
          .moveTo(el)
          .buttonDown(0)
          .elementByCss('#theDiv .res').text().should.become('button down')
          .buttonUp(0)
          .elementByCss('#theDiv .res').text().should.become('button up');
      });
  });

  express.partials['browser.click'] =
    '<div id="theDiv">\n' +
    '  <div class="numOfClicks">not clicked</div>\n' +
    '  <div class="buttonNumber">not clicked</div>\n' +
    '</div>\n';
  it('browser.click', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' var numOfClick = 0;\n' +
        ' numOfClicksDiv = $(\'#theDiv .numOfClicks\');\n' +
        ' buttonNumberDiv = $(\'#theDiv .buttonNumber\');\n' +
        ' current = $(\'#theDiv .current\');\n' +
        ' numOfClicksDiv.mousedown(function(eventObj) {\n' +
        '   var button = eventObj.button;\n' +
        '   if(button === undefined) {button="default";}\n' +
        '   numOfClick++;\n' +
        '   numOfClicksDiv.html("clicked " + numOfClick);\n' +
        '   buttonNumberDiv.html(button);\n' +
        '   return false;\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss('#theDiv .numOfClicks').text().should.become('not clicked')
      .elementByCss('#theDiv .buttonNumber').text().should.become('not clicked')
      .elementByCss('#theDiv .numOfClicks').then(function(el) {
        return browser
          .moveTo(el)
          .click(0)
          .elementByCss('#theDiv .numOfClicks').text()
            .should.become('clicked 1')
          .elementByCss('#theDiv .buttonNumber').text()
            .should.become('0')
          .then(function() {
            if(!env.SAUCE){ // sauce complains when button is missing
              browser
                .click()
                .elementByCss('#theDiv .numOfClicks').text()
                  .should.become('clicked 2')
                .elementByCss('#theDiv .buttonNumber').text()
                  .should.become('0');
            }
          });
      });
  });

  express.partials['browser.doubleclick'] =
    '<div id="theDiv">\n' +
    '  <div>not clicked</div>\n' +
    '</div>\n';
  it('browser.doubleclick', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' div = $(\'#theDiv div\');\n' +
        ' div.dblclick(function() {\n' +
        '   div.html("doubleclicked");\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss('#theDiv div').text().should.become('not clicked')
      .elementByCss('#theDiv div').then(function(div) {
        return browser
          .moveTo(div)
          .doubleclick()
          .elementByCss('#theDiv div').text().should.become('doubleclicked');
      });
  });

  express.partials['browser.type'] =
    '<div id="theDiv"><input type="text"></div>\n';
  it('browser.type', function() {
    var altKey = wd.SPECIAL_KEYS.Alt;
    var nullKey = wd.SPECIAL_KEYS.NULL;
    return browser
      .elementByCss("#theDiv input").then(function(el) {
        return browser
          .getValue(el).should.become('')
          .type(el, 'Hello')
          .getValue(el).should.become('Hello')
          .type(el, [altKey, nullKey, " World"])
          .getValue(el).should.become('Hello World')
          .type(el, "\n")
          .getValue(el).should.become('Hello World');
      })
      .elementByCss("#theDiv input")
        .type(" World").getValue().should.become('Hello World World');
  });

  express.partials['browser.keys'] =
    '<div id="theDiv"><input type="text"></div>\n';
  it('browser.keys', function() {
    var altKey = wd.SPECIAL_KEYS.Alt;
    var nullKey = wd.SPECIAL_KEYS.NULL;
    return browser
      .elementByCss("#theDiv input").then(function(el) {
        return browser
          .getValue(el).should.become('')
          .clickElement(el)
          .keys('Hello')
          .getValue(el).should.become('Hello')
          .clickElement(el).keys([altKey, nullKey, " World"])
          .getValue(el).should.become('Hello World')
          .clickElement(el).keys("\n")
          .getValue(el).should.become('Hello World')
          ;
      });
      // todo: rename the keys method
  });

  express.partials['browser.clear'] =
    '<div id="theDiv">\n' +
    '  <input type="text" value="not cleared">\n' +
    '</div>\n';
  it('browser.clear', function() {
    return browser
      .elementByCss("#theDiv input").then(function(el) {
        return browser
          .getValue(el).should.become('not cleared')
          .clear(el)
          .getValue(el).should.become('');
      })
      .elementByCss("#theDiv input").type("not cleared")
      .getValue().should.become('not cleared')
      .elementByCss("#theDiv input").clear().getValue().should.become('');
  });

  it('browser.title', function() {
    return browser.title().should.become("WD Tests");
  });

  express.partials['browser.text'] =
    '<div id="theDiv"><div>text content</div></div>\n';
  it('browser.text', function() {
    return browser
      .elementByCss("#theDiv").then(function(div) {
        return browser
          .text(div).should.eventually.include("text content")
          .text(div).should.not.eventually.include("div")
          .text().then(function(res) {
            res.should.include("text content");
            res.should.include("WD Tests");
            res.should.not.include("div");
          })
          .text('body').then(function(res) {
            res.should.include("text content");
            res.should.include("WD Tests");
            res.should.not.include("div");
          })
          .text(null).then(function(res) {
            res.should.include("text content");
            res.should.include("WD Tests");
            res.should.not.include("div");
          });
      })
      .elementByCss("#theDiv")
      .text().should.eventually.include("text content");
  });

  express.partials['browser.textPresent'] =
    '<div id="theDiv">weather is sunny</div>\n';
  it('browser.textPresent', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .textPresent('sunny', el).should.eventually.be.ok
          .textPresent('raining', el).should.eventually.not.be.ok;
      })
      .elementByCss("#theDiv").textPresent('sunny').should.eventually.be.ok
      .elementByCss("#theDiv").textPresent('raining').should.eventually.not.be.ok;
      //todo: the args are in the wrong order
  });

  express.partials['browser.getLocation'] =
    '<div id="theDiv">I\'ve got a location</div>\n';
  it('browser.getLocation', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .getLocation(el).then(function(location) {
            should.exist(location.x);
            should.exist(location.y);
          });
      })
      .elementByCss("#theDiv").getLocation().then(function(location) {
        should.exist(location.x);
        should.exist(location.y);
      });
  });

  express.partials['browser.getLocationInView'] =
    '<div id="theDiv">I\'ve got a location</div>\n';
  it('browser.getLocationInView', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .getLocationInView(el).then(function(location) {
            should.exist(location.x);
            should.exist(location.y);
          });
      })
      .elementByCss("#theDiv").getLocationInView().then(function(location) {
        should.exist(location.x);
        should.exist(location.y);
      });
  });

  express.partials['browser.getSize'] =
    '<div id="theDiv">I\'ve got a good size!</div>\n';
  it('browser.getSize', function() {
    return browser
      .elementByCss("#theDiv").then(function(el) {
        return browser
          .getSize(el).then(function(size) {
            should.exist(size.width);
            should.exist(size.height);
          });
      })
      .elementByCss("#theDiv").getSize().then(function(size) {
        should.exist(size.width);
        should.exist(size.height);
      });
  });

  express.partials['browser.acceptAlert'] =
    '<div id="theDiv"><a>click me</a></div>\n';
  it('browser.acceptAlert', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a = $(\'#theDiv a\');\n' +
        ' a.click(function() {\n' +
        '   alert("coffee is running out");\n' +
        '   return false;\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss("#theDiv a").click()
      .acceptAlert();
  });

  express.partials['browser.dismissAlert'] =
    '<div id="theDiv"><a>click me</a></div>\n';
  it('browser.dismissAlert @skip-chrome', function() {
    return browser
      .execute(
        'jQuery( function() {\n' +
        ' a = $(\'#theDiv a\');\n' +
        ' a.click(function() {\n' +
        '   alert("coffee is running out");\n' +
        '   return false;\n' +
        ' });\n' +
        '});\n'
      )
      .elementByCss("#theDiv a").click()
      .dismissAlert();
  });

  express.partials['browser.active'] =
    '<div id="theDiv">\n' +
    '  <input class="i1" type="text" value="input 1">\n' +
    '  <input class="i2" type="text" value="input 2">\n' +
    '</div>\n';
  it('browser.active', function() {
    return browser
      .elementByCss("#theDiv .i1").click()
      .active().getValue().should.become("input 1")
      .elementByCss("#theDiv .i2").click()
      .active().getValue().should.become("input 2");
  });

  it('browser.url', function() {
    return browser
      .url().should.eventually.include("http://")
      .url().should.eventually.include("test-page");
  });

  it('browser.takeScreenshot', function() {
    return browser
      .takeScreenshot().then(function(res) {
        var data = new Buffer(res, 'base64');
        var img = imageinfo(data);
        img.should.not.be.false;
        img.format.should.equal('PNG');
        img.width.should.not.equal(0);
        img.height.should.not.equal(0);
      });
  });

  it('browser.<cookie methods>', function() {
    return browser
      .deleteAllCookies()
      .allCookies().should.eventually.deep.equal([])
      .setCookie({
        name: 'fruit1',
        value: 'apple'
      })
      .allCookies().then(function(res) {
        res.should.have.length(1);
        res.filter(function(c) {
          return c.name === 'fruit1' && c.value === 'apple';
        }).should.have.length(1);
      })
      .setCookie({
        name: 'fruit2',
        value: 'pear'
      })
      .allCookies().then(function(res) {
        res.should.have.length(2);
        res.filter(function(c) {
          return c.name === 'fruit1' && c.value === 'apple';
        }).should.have.length(1);
      })
      .setCookie({
        name: 'fruit3',
        value: 'orange'
      })
      .allCookies().should.eventually.have.length(3)
      .deleteCookie('fruit2')
      .allCookies().then(function(res) {
        res.should.have.length(2);
        res.filter(function(c) {
          return c.name === 'fruit2' && c.value === 'pear';
        }).should.have.length(0);
      })
      .deleteAllCookies()
      .allCookies().should.eventually.deep.equal([])
      // not sure how to test this
      .setCookie({
        name: 'fruit3',
        value: 'orange',
        secure: true
      })
      .deleteAllCookies();
  });

  it('browser.<localStorage methods>', function() {
    return browser
      .setLocalStorageKey('foo', 'bar')
      .getLocalStorageKey('foo').should.become('bar')
      .setLocalStorageKey("bar", "ham")
      .removeLocalStorageKey("bar")
      .getLocalStorageKey("bar").should.eventually.be.a('null')
      .setLocalStorageKey("ham", "foo")
      .clearLocalStorage()
      .getLocalStorageKey("ham").should.eventually.be.a('null');
  });

  express.partials['browser.isVisible'] =
    '<div id="theDiv">\n' +
    '  <a href="#">a1</a>\n' +
    '</div>\n';
  it('browser.isVisible', function() {
    return browser
      .elementByCss("#theDiv a").then(function(el) {
        return browser
          .isVisible(el).should.eventually.be.ok;
      })
      .elementByCss("#theDiv a").isVisible().should.eventually.be.ok
      .isVisible("css selector", "#theDiv a").should.eventually.be.ok
      .execute('$("#theDiv a").hide();')
      .elementByCss("#theDiv a").isVisible().should.eventually.not.be.ok
      .isVisible("css selector", "#theDiv a").should.eventually.not.be.ok;
  });

  it('browser.uploadFile', function() {
    return browser
      .uploadFile("test/mocha.opts").should.eventually.include('mocha.opts')
      .uploadFile("test/midway/assets/tux.jpg").should.eventually.include('tux.jpg');
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
        [1.5 * TIMEOUT_BASE]
      )
      .elementByCss("#theDiv .child").should.be.rejected.with(/status: 7/)
      .waitForCondition(exprCond, 2 * TIMEOUT_BASE, 200).should.eventually.be.ok
      .waitForCondition(exprCond, 2 * TIMEOUT_BASE).should.eventually.be.ok
      .waitForCondition(exprCond).should.eventually.be.ok
      .waitForCondition('$wrong expr!!!').should.be.rejected;
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
        [1.5 * TIMEOUT_BASE]
      )
      .elementByCss("#theDiv .child").should.be.rejected.with(/status: 7/)
      .setAsyncScriptTimeout(5 * TIMEOUT_BASE)
      .waitForConditionInBrowser(exprCond, 2 * TIMEOUT_BASE, 0.2 * TIMEOUT_BASE)
        .should.eventually.be.ok
      .waitForConditionInBrowser(exprCond, 2 * TIMEOUT_BASE)
        .should.eventually.be.ok
      .waitForConditionInBrowser(exprCond).should.eventually.be.ok
      .waitForConditionInBrowser("totally #} wrong == expr").should.be.rejected
      .setAsyncScriptTimeout(0);
  });

  it('err.inspect', function() {
    return browser
      .safeExecute("invalid-code> here").then(
        function() { assert(false); },
        function(err) {
          should.exist(err);
          (err instanceof Error).should.be.true;
          (err.inspect().length <= 510).should.be.true;
        }
      );
  });

});
