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

var Q = wd.Q;

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
caps.platform = 'Linux';
caps.version = '4.3';
caps['device-orientation'] = 'portrait';
caps.device = 'Android';
 
caps.app = 'http://appium.s3.amazonaws.com/NotesList.apk';
caps['app-activity'] = '.NotesList';
caps['app-package'] = 'com.example.android.notepad';

caps.name = 'Sauce Android Appium Example';

browser.init(caps).then(function() {
  return browser
    .elementByName("New note")
      .click()
    .elementByTagName("textfield")
      .sendKeys("This is a new note!")
    .elementByName("Save")
      .click()
    .elementsByTagName("text")
      .then(function(els) {
        return Q.all([
          els[2].text().should.become("This is a new note!"),
          els[2].click()
        ])
    }).sauceJobStatus(true)
    .catch(function(err) {
      return browser.sauceJobStatus(false).thenReject(err);
    }).fin(function() { return browser.quit(); });
}).done();
