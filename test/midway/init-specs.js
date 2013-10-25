
var setup = require('../helpers/setup');

describe('browser. tests (' + setup.testEnv + ') @multi', function() {

  var browser;

  before(function() {
    browser = setup.remote();
  });

  afterEach(function() {
    return setup.closeBrowser();
  });

  it("default should be firefox", function() {
    browser.defaultCapabilities.should.deep.equal({
      browserName: 'firefox',
      version: '',
      javascriptEnabled: true,
      platform: 'ANY'
    });
    return browser
      .init()
      .sessionCapabilities().should.eventually.have.property('browserName', 'firefox');
  });

  it("setting browser default", function() {
    browser.defaultCapabilities.browserName = 'chrome';
    browser.defaultCapabilities.javascriptEnabled = false;

    browser.defaultCapabilities.should.deep.equal({
      browserName: 'chrome',
      version: '',
      javascriptEnabled: false,
      platform: 'ANY'
    });
    return browser
      .init()
      .sessionCapabilities().should.eventually.have.property('browserName', 'chrome');
  });

  it("desired browser as parameter", function() {
    browser.defaultCapabilities.browserName = 'firefox';
    return browser
      .init({browserName: 'chrome'})
      .sessionCapabilities().should.eventually.have.property('browserName', 'chrome');
  });

  if(env.SAUCE){

    it("setting browser platform to VISTA @saucelabs", function() {
      browser.defaultCapabilities.platform = 'VISTA';
      browser.defaultCapabilities.browserName = 'firefox';

      return browser
        .init()
        .sessionCapabilities().should.eventually.have.property('platform', 'XP');
    });

    it("setting browser platform to LINUX @saucelabs", function() {
      browser.defaultCapabilities.browserName = 'chrome';
      browser.defaultCapabilities.platform = 'LINUX';

      return browser
        .init()
        .sessionCapabilities().should.eventually.have.property('platform', 'LINUX');
    });

    it("configuring explorer in desired @saucelabs", function() {
      // todo: clone setup desired and modify it
      var desired = {
        browserName: 'iexplore',
        platform: 'Windows 2008',
        name: 'browser init using desired',
        tags: ['wd', 'test'],
        "record-video": false
      };

      return browser
        .init(desired)
        .sessionCapabilities().then(function(sessionCapabilities) {
          sessionCapabilities.platform.should.equal('WINDOWS');
          sessionCapabilities.browserName.should.include('explorer');
        });
    });
  }
});
