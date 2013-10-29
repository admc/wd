/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

require('../helpers/setup');

describe('window - frame ' + env.ENV_DESC + ' @skip-android @skip-ios', function() {
  this.timeout(env.TIMEOUT);

  var browser;
  var allPassed = true;
  var express = new Express( __dirname + '/assets' );

  before(function() {
    express.start();
    browser = wd.promiseChainRemote(env.REMOTE_CONFIG);
    var sauceExtra = {
      name: sauceJobTitle(this.runnable().parent.title),
      tags: ['midway']
    };
    return browser
      .configureLogging()
      .init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null ));
  });

  beforeEach(function() {

    return browser
      .windowHandles().should.eventually.have.length.below(2)
      .get( midwayUrl(
        this.currentTest.parent.title,
        this.currentTest.title) + "&window_num=1" ).printError();
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
    return browser
      .windowHandles().then(function(handles) {
        var seq = [];
        _(handles).each(function(handle, i) {
          if(i>0) {
            seq.push(function() { return browser.window(handle).close(); });
          }
        });
        if(handles.length > 0) {
          seq.push(function() {return browser.window(handles[0]);});
        }
        return seq.reduce(Q.when, new Q());
      });
  });

  after(function() {
    express.stop();
    return browser
      .quit().then(function() {
        if(env.SAUCE) { return(browser.sauceJobStatus(allPassed)); }
      });
  });

  express.partials['browser.windowName'] = "";
  it('browser.windowName', function() {
    return browser
      .execute('window.name="window-1"')
      .windowName().should.become('window-1');
  });

  express.partials['browser.windowHandle'] = "";
  it('browser.windowHandle', function() {
    return browser
      .windowHandle()
      .should.eventually.have.length.above(0)
      .then(); // going round mocha-as-promised bug
  });

  express.partials['browser.newWindow'] = "";
  it('browser.newWindow', function() {
    return browser.url(function(url) {
      return browser
        .newWindow( url.replace("window_num=1", "window_num=2"),'window-2');
    });
  });

  express.partials['browser.window'] = "";
  it('browser.window', function() {
    return Q.all([
        browser.url(),
        browser.windowHandle()
    ]).then(function(res) {
      var url = res[0];
      var handle1 = res[1];
      return browser
        .newWindow(url.replace("window_num=1", "window_num=2"), 'window-2')
        .window('window-2')
        .windowName().should.become('window-2')
        .window(handle1)
        .windowHandle().should.become(handle1);
    });
  });

  express.partials['browser.windowHandles'] = "";
  it('browser.windowHandles', function() {
    return browser
      .url()
      .then(function(url) {
        return browser
          .newWindow(url.replace("window_num=1", "window_num=2"), 'window-2')
          .windowHandles().should.eventually.have.length(2)
          .window('window-2')
          .close()
          .windowHandles().should.eventually.have.length(1);
      });
  });

  express.partials['browser.getWindowSize'] = "";
  it('browser.getWindowSize', function() {
    return browser
      .getWindowSize().then(function(size) {
        size.width.should.exist;
        size.height.should.exist;
      })
      .windowHandle().then(function(handle) {
        return browser
          .getWindowSize(handle).then(function(size) {
            size.width.should.exist;
            size.height.should.exist;
          });
      });
  });

  express.partials['browser.setWindowSize'] = "";
  it('browser.setWindowSize', function() {
    return browser
      .getWindowSize().then(function(size) {
        return browser
          .setWindowSize(size.width - 10, size.height - 5)
          .getWindowSize().then(function(newSize) {
            newSize.width.should.equal(size.width - 10);
            newSize.height.should.equal(size.height - 5);
          })
          .windowHandle(function(handle) {
            return browser
              .setWindowSize(size.width - 15, size.height - 10, handle)
              .getWindowSize().then(function(newSize) {
                newSize.width.should.equal(size.width - 15);
                newSize.height.should.equal(size.height - 10);
              });
          });
      });
  });

  express.partials['browser.getWindowPosition'] = "";
  it('browser.getWindowPosition', function() {
    return browser
      .getWindowPosition().then(function(pos) {
        pos.x.should.exist;
        pos.y.should.exist;
      })
      .windowHandle().then(function(handle) {
        return browser
          .getWindowPosition(handle).then(function(pos) {
            pos.x.should.exist;
            pos.y.should.exist;
          });
      });
  });

  express.partials['browser.setWindowPosition'] = "";
  it('browser.setWindowPosition', function() {
    return browser
      .getWindowPosition().then(function(pos) {
        return browser
          // not working whithout handle
          .windowHandle(function(handle) {
            return browser
              .setWindowPosition(pos.width - 15, pos.height - 10, handle)
              .getWindowPosition().then(function(newPos) {
                newPos.width.should.equal(pos.width - 15);
                newPos.height.should.equal(pos.height - 10);
              });
          })
        ;

      });
  });

  it('browser.frame', function() {
    return browser
      .get( env.MIDWAY_ROOT_URL + "/frame-test/index.html")
      .elementsByTagName('frame').should.eventually.have.length(3)
      .frame(0)
      .elementsByTagName('body').text().should.eventually.include("Menu!")
      .frame()
      .elementsByTagName('frame').then(function(frames) {
        frames.should.have.length(3);
        return browser
          .frame(frames[1])
          .elementsByTagName('body').text().should.eventually.include("Welcome!");
      })
      .frame()
      .elementsByTagName('frame').then(function(frames) {
        return browser.getAttribute(frames[2],'id').then(function(id) {
          browser
            .frame(id)
            .elementsByTagName('body').text().should.eventually.include("Banner!");
        });
      });
  });

});
