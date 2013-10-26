function testInfo(testDesc) {
  return {
    name: "midway window - frame " + testDesc ,
    tags: ['midway']
  };
}

var setup = require('../helpers/setup');

describe('window - frame api test (' + setup.testEnv + ') ' +
  '@skip-android @skip-ios', function() {
  this.timeout(env.INIT_TIMEOUT);
  var browser;
  var express = new setup.Express( __dirname + '/assets' );

  function cleanTitle(title) {
    return title.replace(/@[-\w]+/g, '').trim();
  }

  var getUrlBase = function(test) {
    return env.MIDWAY_ROOT_URL + '/test-page?partial=' +
      encodeURIComponent(cleanTitle(test.runnable().title));
  };

  before(function() {
    express.start();
  });

  beforeEach(function() {
    return browser = setup.remote();
  });

  afterEach(function() {
    return setup.closeBrowser();
  });

  afterEach(function() {
    return setup.jobStatus(this.currentTest.state === 'passed');
  });

  after(function() {
    express.stop();
  });

  express.partials['browser.windowName'] = "";
  it('browser.windowName', function() {
    return browser
      .init(setup.desiredWithTestInfo(testInfo('#1')))
      .get( getUrlBase(this) + "&window_num=1")
      .execute('window.name="window-1"')
      .windowName().should.become('window-1');
  });

  express.partials['browser.windowHandle'] = "";
  it('browser.windowHandle', function() {
    return browser
      .init(setup.desiredWithTestInfo(testInfo('#2')))
      .get( getUrlBase(this) + "&window_num=1")
      .windowHandle().should.eventually.have.length.above(0);
  });

  express.partials['browser.newWindow'] = "";
  it('browser.newWindow', function() {
    return browser
      .init(setup.desiredWithTestInfo(testInfo('#3')))
      .get( getUrlBase(this) + "&window_num=1")
      .newWindow(getUrlBase(this) + "&window_num=2", 'window-2');
  });

  express.partials['browser.window'] = "";
  it('browser.window', function() {
    var that = this;
    return browser
      .init(setup.desiredWithTestInfo(testInfo('#4')))
      .get( getUrlBase(this) + "&window_num=1")
      .windowHandle().then(function(handle1) {
        return browser
          .newWindow(getUrlBase(that) + "&window_num=2", 'window-2')
          .window('window-2')
          .windowName().should.become('window-2')
          .window(handle1)
          .windowHandle().should.become(handle1);
      })
      ;
  });

  express.partials['browser.windowHandles'] = "";
  it('browser.windowHandles', function() {
    return browser
      .init(setup.desiredWithTestInfo(testInfo('#5')))
      .get( getUrlBase(this) + "&window_num=1")
      .windowHandles().should.eventually.have.length(1)
      .newWindow(getUrlBase(this) + "&window_num=2", 'window-2')
      .windowHandles().should.eventually.have.length(2)
      .window('window-2')
      .close()
      .windowHandles().should.eventually.have.length(1);
  });

  express.partials['browser.getWindowSize'] = "";
  it('browser.getWindowSize', function() {
    return browser
      .init(setup.desiredWithTestInfo(testInfo('#6')))
      .get( getUrlBase(this) + "&window_num=1")
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
      .init(setup.desiredWithTestInfo(testInfo('#7')))
      .get( getUrlBase(this) + "&window_num=1")
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
      .init(setup.desiredWithTestInfo(testInfo('#8')))
      .get( getUrlBase(this) + "&window_num=1")
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
      .init(setup.desiredWithTestInfo(testInfo('#9')))
      .get( getUrlBase(this) + "&window_num=1")
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
      .init(setup.desiredWithTestInfo(testInfo('#10')))
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
