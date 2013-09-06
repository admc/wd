var _ = require("lodash");

var test = require('../common/promise-chain-test-base').test,
    utils = require('../common/utils');

describe("wd", function() {
  describe("local", function() {
    describe("promise chain test", function() {
      _(utils.browsers).each(function (browser) {
        describe("using " + browser, function() {
          test({}, {
            browserName: browser
          });
        });
      });
    });
  });
});
