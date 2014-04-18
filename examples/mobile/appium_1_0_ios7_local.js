var host = process.env.APPIUM_HOST || "localhost";
var port = parseInt(process.env.APPIUM_PORT, 10) || 4723;
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

caps = {device: 'iPhone Simulator'};
caps.deviceName = 'iPhone Retina (4-inch 64-bit)';
caps.platform = 'ios';
caps.version = '7.1';
caps['device-orientation'] = 'portrait';
caps.app = 'safari';

caps.name = 'Sauce Ios7 Appium Example';

browser.init(caps).then(function() {
  return browser
    .get("http://admc.io/wd/mobile-test-pages/index.html")
    .title()
      .should.become('WD Tests - Mobile')
    .elementById('theDiv').text()
      .should.eventually.include('bonjour')
    .elementsByCss('#theDiv .hello')
     .should.eventually.have.length(3)
    .shake()
    .contexts().print("contexts --> ")
    .fin(function() { return browser.quit(); });
}).done();
