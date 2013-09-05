var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../lib/main');
}

var browser = wd.promiseRemote();
var Q = browser.Q;
browser._debugPromise();

browser
  .init({browserName: 'chrome'})
  .get('http://angularjs.org/')
  .elementById('the-basics')
  .text().then(function(text) {
    console.log('text is', text );
    return Q.all([
      browser.elementById('the-basics'),
      browser.sleep(5000)]);
  })
  .get('http://google.com/')
  .catch(function(err) {
    console.log(err.stack);
  })
  .then(function() {
    console.log("Hey I've finished");
  })
  .quit()
  .done();
