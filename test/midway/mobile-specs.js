require('../helpers/setup');

describe('mobile ' + env.ENV_DESC + ' @skip-chrome @skip-firefox @skip-explorer' , function() {
  var partials = {};

  var browser;
  require('./midway-base')(this, partials).then(function(_browser) { browser = _browser; });

  it('browser.setOrientation @skip-ios', function() {
    return browser
      .setOrientation('LANDSCAPE');
  });

});
