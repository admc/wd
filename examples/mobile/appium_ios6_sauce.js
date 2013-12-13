var username = process.env.SAUCE_USERNAME;
var accessKey = process.env.SAUCE_ACCESS_KEY;

require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var browser = wd.promiseChainRemote("ondemand.saucelabs.com", 80, username, accessKey);

// optional extra logging
//browser._debugPromise();
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

var desired = {
  browserName: '',
  version: '6.1',
  'device-orientation': 'portrait',
  app: 'safari',
  device: 'iPhone Simulator'
};

browser.init(desired).then(function() {
  return browser
    .sauceJobUpdate({tags:['example']})
    .get("http://admc.io/wd/mobile-test-pages/index.html")

    .title()
      .should.become('WD Tests - Mobile')
    .elementById('theDiv').text()
      .should.eventually.include('bonjour')
    .elementsByCss('#theDiv .hello')
     .should.eventually.have.length(3)

    .sauceJobStatus(true)
    .catch(function(err) {
      return browser.sauceJobStatus(false).thenReject(err);
    })
    .fin(function() { return browser.quit(); });
}).done();
