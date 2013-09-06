var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../lib/main');
}

var browser = wd.promiseRemote();
browser._debugPromise();

browser
  .init({browserName: 'chrome'})
  .get('http://angularjs.org/')
  .elementById('the-basics')
  .text().then(function(text) {
    console.log('text is', text );
  })
  .catch(function(err) {
    console.log(err.stack);
  })
  .quit()
  .done();
