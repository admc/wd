require('../helpers/setup');

describe('mobile ' + env.ENV_DESC, skip('chrome', 'firefox', 'explorer'), function() {
  var partials = {};

  var browser;
  require('./midway-base')(this, partials).then(function(_browser) { browser = _browser; });

  it('browser.setOrientation', skip('ios'), function() {
    return browser
      .setOrientation('LANDSCAPE');
  });

});
