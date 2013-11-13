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

var Q = wd.Q;

var browser = wd.promiseChainRemote();

// optional extra logging
//browser._debugPromise();
browser.on('status', function(info) {
  console.log(info.cyan);
});
browser.on('command', function(meth, path, data) {
  console.log(' > ' + meth.yellow, path.grey, data || '');
});

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
  .fin(function() { return browser.sleep(2000).quit(); })
  .done();
