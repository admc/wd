var host = process.env.APPIUM_HOST || "ondemand.saucelabs.com";
var port = parseInt(process.env.APPIUM_PORT, 10) || 80;
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

var browser = wd.promiseChainRemote(host, port, username, accessKey);

// optional extra logging
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(eventType, command, response) {
  console.log(' > ' + eventType.cyan, command, (response || '').grey);
});
browser.on('http', function(meth, path, data) {
  console.log(' > ' + meth.magenta, path, (data || '').grey);
});

var caps;

// go there https://saucelabs.com/platforms/appium
// and cut/paste the caps if it doesn't work out 
caps = {browserName: ''};
caps.platform = 'OS X 10.9';
caps.version = '7.1';
caps['device-orientation'] = 'portrait';
caps.app = 'safari';
caps.device = 'iPhone Simulator';

caps.name = 'Sauce Ios7 Appium Example';

browser.init(caps).then(function() {
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
