// spliting the test cause it takes too long, list of possible suffixes below
// var suffixes =
//   ['ByClassName', 'ByCssSelector', 'ById', 'ByName', 'ByLinkText',
//   'ByPartialLinkText', 'ByTagName', 'ByXPath', 'ByCss'];

exports.test = function function_name (suffix, extraDesc, partials, criterias) {

  require('../helpers/setup');

  describe('api-el-' + extraDesc + ' ' + env.ENV_DESC, function() {

    var ctx = require('./midway-base')(this),
        express = ctx.express,
        browser;
    ctx.browser.then(function(_browser) { browser = _browser; });

    var elementFuncName = 'element' + suffix;
    express.partials['browser.' + elementFuncName] = partials.one;
    it('browser.' + elementFuncName, function() {
      return Q.all([
        browser[elementFuncName](criterias.valid).should.eventually.exist,
        browser[elementFuncName](criterias.invalid).should.be.rejectedWith(/status: 7/)
      ]);
    });

    var elementFuncNameOrNull = 'element' + suffix + 'OrNull';
    express.partials['browser.' + elementFuncNameOrNull] = partials.one;
    it('browser.' + elementFuncNameOrNull, function() {
      return browser
        [elementFuncNameOrNull](criterias.valid).should.eventually.exist
        [elementFuncNameOrNull](criterias.invalid).should.eventually.be.a('null');
    });

    var elementFuncNameIfExists = 'element' + suffix + 'IfExists';
    express.partials['browser.' + elementFuncNameIfExists] = partials.one;
    it('browser.' + elementFuncNameIfExists, function() {
      return browser
        [elementFuncNameIfExists](criterias.valid).should.eventually.exist
        [elementFuncNameIfExists](criterias.invalid).should.eventually.be.a('undefined');
    });

    var hasElementFuncName = 'hasElement' + suffix;
    express.partials['browser.' + hasElementFuncName] = partials.one;
    it('browser.' + hasElementFuncName, function() {
      return browser
        [hasElementFuncName](criterias.valid).should.eventually.be.ok
        [hasElementFuncName](criterias.invalid).should.eventually.not.be.ok;
    });

    var waitForElementFuncName = 'waitForElement' + suffix;
    express.partials['browser.' + waitForElementFuncName] =
      '<div id="theDiv"></div>';
    it('browser.' + waitForElementFuncName, function() {
      var startMs = Date.now();
      return browser
        .executeAsync(
          'var args = Array.prototype.slice.call( arguments, 0 );\n' +
          'var done = args[args.length -1];\n' +
          'setTimeout(function() {\n' +
          ' $("#theDiv").append(args[0]);\n' +
          '}, args[1]);\n' +
          'done();\n',
          [partials.child, env.BASE_TIME_UNIT]
        )
        .then(function() {
          // if selenium was too slow skip the test.
          if(Date.now() - startMs < env.BASE_TIME_UNIT){
            return browser[elementFuncName](criterias.child)
              .should.be.rejectedWith(/status: 7/);
          }
        })
        [waitForElementFuncName](criterias.child, 2 * env.BASE_TIME_UNIT)
        .should.be.fulfilled
        .then(function() {
          return browser
            [waitForElementFuncName]("__wrongsel", 0.1 * env.BASE_TIME_UNIT)
              .should.be.rejectedWith('Element condition wasn\'t satisfied!');
        });
    });

    var waitForVisibleFuncName = 'waitForVisible' + suffix;
    express.partials['browser.' + waitForVisibleFuncName] =
      '<div id="theDiv"></div>';
    it('browser.' + waitForVisibleFuncName, function() {
      return browser
        .executeAsync(
          'var args = Array.prototype.slice.call( arguments, 0 );\n' +
          'var done = args[args.length -1];\n' +
          '$("#theDiv").append(args[0]);\n' +
          '$("#theDiv .child").hide();\n' +
          'setTimeout(function() {\n' +
          ' $("#theDiv .child").show();\n' +
          '}, args[1]);\n' +
          'done();\n',
          [partials.child, env.BASE_TIME_UNIT]
        )
        [elementFuncName](criterias.child).should.eventually.exist
        [waitForVisibleFuncName](criterias.child, 2 * env.BASE_TIME_UNIT)
        .should.be.fulfilled
        .then(function() {
          return browser
            [waitForVisibleFuncName]("__wrongsel", 0.1 * env.BASE_TIME_UNIT)
              .should.be.rejectedWith(/Element didn\'t become visible/);
        });
    });

    var elementsFuncName = 'elements' + suffix;
    express.partials['browser.' + elementsFuncName] = partials.several;
    it('browser.' + elementsFuncName, function() {
      return browser
        [elementsFuncName](criterias.valid).then(function(res) {
          if (elementsFuncName.match(/ById/)) {
            res.should.have.length(1);
          } else if (elementsFuncName.match(/ByTagName/)) {
            (res.length > 1).should.be.true;
          } else {
            res.should.have.length(3);
          }
        })
        [elementsFuncName](criterias.invalid)
          .should.eventually.deep.equal([]);
    });

  });
};

