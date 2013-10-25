var setup = require('../helpers/setup');

describe('window/frame test (' + setup.testEnv + ')', function() {

  var browser;
  var express = new setup.Express( __dirname + '/assets' );

  function cleanTitle(title) {
    return title.replace(/@[-\w]+/g, '').trim();
  }

  before(function() {
    express.start();
    return browser = setup.initBrowser();
  });

  after(function() {
    express.stop();
    return setup.closeBrowser();
  });

  express.partials['browser.<window methods>'] = "";
  it('browser.<window methods>', function() {
    // todo: split this in separate tests
    var urlBase = 'http://127.0.0.1:8181/test-page?partial=' +
      encodeURIComponent(cleanTitle(this.runnable().title));

    return browser
      .get( urlBase + "&window_num=1")
      .execute('window.name="window-1"')
      .windowName().should.become('window-1')
      .windowHandle().should.eventually.have.length.above(0)
      .newWindow(urlBase + "&window_num=2", 'window-2')
      .window('window-2')
      .windowName().should.become('window-2')
      .windowHandle().then(function(w2Handle) {
        return browser
          .newWindow(urlBase + "&window_num=3", 'window-3')
          .window('window-3')
          .windowName().should.become('window-3')
          .windowHandle().should.eventually.not.equal(w2Handle)
          .windowHandles().should.eventually.have.length(3)
          .window(w2Handle)
          .windowName().should.become('window-2')
          .close()
          .windowHandles().should.eventually.have.length(2);
      })
      .window('window-3')
      .getWindowSize('window-3').then(function(size) {
        return browser
          .setWindowSize(size.width -20, size.height - 10, 'window-3')
          // todo: strange to pass the window as the last parameter
          .getWindowSize('window-3').then(function(newSize) {
            newSize.should.have.property('width', size.width - 20);
            newSize.should.have.property('height', size.height - 10);
          })
          .setWindowSize(size.width -25, size.height - 15)
          .getWindowSize().then(function(newSize) {
            newSize.should.have.property('width', size.width - 25);
            newSize.should.have.property('height', size.height - 15);
          });
      })
      .getWindowPosition('window-3').then(function(pos) {
        return browser
          .setWindowPosition(pos.x + 10, pos.y + 5, 'window-3')
          // todo: strange to pass the window as the last parameter
          .getWindowPosition('window-3').then(function(newPos) {
            newPos.should.have.property('x', pos.x + 10);
            newPos.should.have.property('y', pos.y + 5);
          })
          .setWindowPosition(pos.x + 15, pos.y + 10)
          // todo: strange to pass the window as the last parameter
          .getWindowPosition().then(function(newPos) {
            newPos.should.have.property('x', pos.x + 15);
            newPos.should.have.property('y', pos.y + 10);
          });
      })
      .close()
      .windowHandles().should.eventually.have.length(1)
      .window('window-1')
      .newWindow(urlBase + "&window_num=4")
      .windowHandles().then(function(handles) {
        handles.should.have.length(2);
        return browser
          .window(handles[1])
          .url().should.eventually.include("window_num=4")
          .close()
          .windowHandles().should.eventually.have.length(1)
          .window(handles[0]);
      });
  });

  it('browser.frame', function() {
    return browser
      .get("http://127.0.0.1:8181/frame-test/index.html")
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
