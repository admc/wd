require('../helpers/setup');

describe('mobile ' + env.ENV_DESC + ' @skip-chrome @skip-firefox @skip-explorer' , function() {

  var ctx = require('./midway-base')(this),
      // express = ctx.express,
      browser;
  ctx.browser.then(function(_browser) { browser = _browser; });

  it('browser.setOrientation @skip-ios', function() {
    return browser
      .setOrientation('LANDSCAPE');
  });

});
