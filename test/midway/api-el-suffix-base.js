// spliting the test cause it takes too long, list of possible suffixes below
// var suffixes =
//   ['ByClassName', 'ByCssSelector', 'ById', 'ByName', 'ByLinkText',
//   'ByPartialLinkText', 'ByTagName', 'ByXPath', 'ByCss'];

exports.test = function function_name (suffixes, extraDesc) {

  require('../helpers/setup');

  describe('api-el-' + extraDesc + ' ' + env.ENV_DESC, function() {

    var ctx = require('./midway-base')(this),
        express = ctx.express,
        browser;
    ctx.browser.then(function(_browser) { browser = _browser; });

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

    _(suffixes).each(function(suffix) {
      var suffixFields = getSuffixFields(suffix);

      var elementFuncName = 'element' + suffix;
      express.partials['browser.' + elementFuncName] = allElementsPartial;
      it('browser.' + elementFuncName, function() {
        return Q.all([
          browser[elementFuncName](suffixFields.searchOne).should.eventually.exist,
          browser[elementFuncName](suffixFields.searchOneInvalid).should.be.rejectedWith(/status: 7/)
        ]);
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
            [suffixFields.childHtml, env.BASE_TIME_UNIT]
          )
          [elementFuncName](suffixFields.searchChild).should.be.rejectedWith(/status: 7/)
          [waitForElementFuncName](suffixFields.searchChild, 2 * env.BASE_TIME_UNIT)
          .should.be.fulfilled
          .then(function() {
            return browser
              [waitForElementFuncName]("__wrongsel", 0.1 * env.BASE_TIME_UNIT)
                .should.be.rejectedWith(/Element didn\'t appear/);
          });
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
            [suffixFields.childHtml, env.BASE_TIME_UNIT]
          )
          .elementByCss(".child").should.eventually.exist
          [waitForVisibleFuncName](suffixFields.searchChild, 2 * env.BASE_TIME_UNIT)
          .should.be.fulfilled
          .then(function() {
            return browser
              [waitForVisibleFuncName]("__wrongsel", 0.1 * env.BASE_TIME_UNIT)
                .should.be.rejectedWith(/Element didn\'t become visible/);
          });
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

  });
};

