var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../lib/main');
}

var browser = wd.promiseRemote();
var Q = browser.Q;

// request logging
browser.on('status', function(info){
  console.log('\x1b[36m%s\x1b[0m', info);
});
browser.on('command', function(meth, path, data){
  console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
});

// promise debugging
// browser._debugPromise();

function dragNDrop(fromId, toId) {
  return function() {
    return Q.all([
      browser.elementById(fromId),
      browser.elementById(toId),
      ]).then(function(els) {
        return browser
          .moveTo(els[0])
          .buttonDown()
          .moveTo(els[1])
          .buttonUp();
      });
  };
}

browser
  .init({browserName: 'chrome'})
  .get('http://jqueryui.com/resources/demos/droppable/default.html')
  .then( dragNDrop("draggable", "droppable") )
  .catch(function(err) {
    console.log(err.stack);
  })
  .sleep(5000)
  .quit()
  .done();
