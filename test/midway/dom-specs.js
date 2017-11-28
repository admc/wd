require('../helpers/setup');
var base = require('./midway-base');

describe('timeouts for DOM elements', function () {

  var page = '<div id="theDiv"></div>';
  var setUpBase = base(
    this,
    {
      waitForElementById: page,
      waitForElementByCss: page,
      waitForElementByTagName: page,
      waitForElementByClassName: page
    },
    1000
  );
  var appendChild = function () {
    setTimeout(function () {
      $("#theDiv")
        .append("<div class=\"child\">a waitFor child</div>")
        .append("<a>a waitFor anchor child</a>")
        .append("<div id=\"child\">a waitFor child with ID</div>>");
    }, arguments[0]);
  };

  describe('generic timeout is long enough to find elements', function () {

    it('waitForElementByClassName', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [500])
          .elementByCss(".child").should.be.rejectedWith(/status: 7/)
          .waitForElementByClassName("child")
          .text().should.become('a waitFor child');
      });
    });

    it('waitForElementByCss', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [500])
          .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
          .waitForElementByCss("#theDiv .child")
          .text().should.become('a waitFor child');
      });
    });

    it('waitForElementById', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [500])
          .elementByCss("#child").should.be.rejectedWith(/status: 7/)
          .waitForElementById("child")
          .text().should.become('a waitFor child with ID');
      });
    });

    it('waitForElementByTagName', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [500])
          .elementByCss("a").should.be.rejectedWith(/status: 7/)
          .waitForElementByTagName("a")
          .text().should.become('a waitFor anchor child');
      });
    });
  });

  describe('generic timeout is too short to find elements', function () {

    it('waitForElementByClassName', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [2000])
          .elementByCss(".child").should.be.rejectedWith(/status: 7/)
          .waitForElementByClassName("child").should.be.rejectedWith('Element condition wasn\'t satisfied!');
      });
    });

    it('waitForElementByCss', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [2000])
          .elementByCss("#theDiv .child").should.be.rejectedWith(/status: 7/)
          .waitForElementByCss("#theDiv .child").should.be.rejectedWith('Element condition wasn\'t satisfied!');
      });
    });

    it('waitForElementById', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [2000])
          .elementByCss("#child").should.be.rejectedWith(/status: 7/)
          .waitForElementById("child").should.be.rejectedWith('Element condition wasn\'t satisfied!');
      });
    });

    it('waitForElementByTagName', function () {
      return setUpBase.then(function (_browser) {
        return _browser
          .execute(appendChild, [2000])
          .elementByCss("a").should.be.rejectedWith(/status: 7/)
          .waitForElementByTagName("a").should.be.rejectedWith('Element condition wasn\'t satisfied!');
      });
    });

  });
});
