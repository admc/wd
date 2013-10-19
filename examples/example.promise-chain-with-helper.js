var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../lib/main');
}

var browser = wd.promiseChainRemote();
browser._debugPromise();

function search(something) {
  return function() {
    return browser
      .elementByCss('input[name=q]')
      .type(something)
      .keys(wd.SPECIAL_KEYS.Return);
  };
}

browser
  .init({browserName: 'chrome'})
  .get('http://www.google.com')
  .then(search('wd'))
  .catch(function(err) {
    console.log(err.stack);
  })
  .sleep(5000)
  .quit()
  .done();
