var setup = require('../helpers/setup-async');

describe('deprecated chaining tests(' + setup.testEnv + ')', function() {

  describe('full chaining', function() {
    var browser;

    before(function() {
      browser = setup.remote();
    });

    it("full chaining should work", function(done) {
      /* jshint evil: true */
      browser.chain()
        .init(setup.desired)
        .get("http://admc.io/wd/test-pages/guinea-pig.html")
        .title(function(err, title) {
          title.should.include('I am a page title - Sauce Labs');
        })
        .quit(function(err) {
          expect(err).to.not.exist;
          done();
        });
    });
  });

  describe('partial chaining', function() {
    var browser;

    before(function(done) {
      browser = setup.initBrowser(done);
    });

    after(function(done) {
      setup.closeBrowser(done);
    });

    beforeEach(function(done) {
      browser.get("http://admc.io/wd/test-pages/guinea-pig.html", done);
    });

    it("partial chaining should work", function(done) {
      /* jshint evil: true */
      browser.chain()
        .title(function(err, title) {
          title.should.include('I am a page title - Sauce Labs');
        })
        .elementById('submit', function(err, el) {
          expect(err).to.not.exist;
          should.exist(el);

          // Commenting this test, nothing preventing quit to be called first
          // we should make clickElement not require a callback
          // browser.clickElement(el, function(err) {
          //  should.not.exist.err;
          //});
        })
        .eval("window.location.href", function(err, href) {
          href.should.include('http');
          done(null);
        });
    });

    var asyncCallCompleted = false;
    it("browser.queueAddAsync", function(done) {
      browser.chain()
        .title(function(err, title) {
          title.should.include('I am a page title - Sauce Labs');
        })
        .queueAddAsync( function(cb) {
          setTimeout(function() {
            asyncCallCompleted = true;
            cb(null);
          }, 250);
        })
        .elementById('submit', function(err, el) {
          expect(err).to.not.exist;
          should.exist(el);
          asyncCallCompleted.should.be.true;
          done(null);
        });
    });
  });

});
