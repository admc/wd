var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../lib/main');
}

var browser = wd.promiseRemote();
var Q = browser.Q;
browser._debugPromise();

function sleeper() {
  console.log("---> sleeper starts");
  var deferred = Q.defer();
  setTimeout(function() {
    console.log("---> sleeper finishes");
    deferred.resolve();
  }, 2000);
  return deferred.promise;
}

browser
  .init({browserName: 'chrome'})
  .get('http://angularjs.org/')
  .elementById('the-basics')
  .text().then(function(text) {
    console.log('text is', text );
    return Q.all([
      browser.elementById('the-basics'),
      sleeper()]);
  })
  .get('http://google.com/')
  .catch(function(err) {
    throw err;
  })
  .then(function() {
    console.log("Hey I've finished");
  })
  .quit()
  .done();
