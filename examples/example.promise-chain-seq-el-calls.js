var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../lib/main');
}

var browser = wd.promiseChainRemote();
browser._debugPromise();

browser
  .init({browserName: 'chrome'})
  .get('http://angularjs.org/')
  .elementById('the-basics')
  .text().click()//.text()
  .elementById('the-basics')
  .text('>').click('>').text()
  .catch(function(err) {
    console.log(err.stack);
  })
  .quit()
  .done();
