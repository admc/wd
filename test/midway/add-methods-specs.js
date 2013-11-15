/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

require('../helpers/setup');

describe('add-methods ' + env.ENV_DESC, function() {
  this.timeout(env.TIMEOUT);

  var extraAsyncMethods = {
    sleepAndElementById: function(id, cb) {
      var _this = this;
      _this.sleep(200, function(err) {
        if(err) { return cb(err); }
        _this.elementById(id, cb);
      });
    },
    sleepAndText: function(el, cb) {
      var _this = this;
      _this.sleep(200, function(err) {
        if(err) { return cb(err); }
        _this.text(el, cb);
      });
    },
    elementByCssWhenReady: function(selector, timeout, cb) {
      var _this = this;
      _this.waitForElementByCss(selector, timeout, function(err) {
        if(err) { return cb(err); }
        _this.elementByCss(selector, cb);
      });
    }
  };

  var extraPromiseChainMethods = {
    sleepAndElementById: function(id) {
      return this
        .sleep(200)
        .elementById(id);
    } ,
    sleepAndText: function(el) {
      return this
        .sleep(200)
        .text(el);
    }
  };

  var extraPromiseNoChainMethods = {
    sleepAndElementById: function(id) {
      var _this = this;
      return this
        .sleep(200)
        .then(function() {
          return _this.elementById(id);
        });

    } ,
    sleepAndText: function(el) {
      var _this = this;
      return this
        .sleep(200)
        .then(function() {
          return _this.text(el);
        });
    }
  };

  var allExtraMethodNames = _.union(
    _(extraAsyncMethods).keys().value(),
    _(extraPromiseChainMethods).keys().value(),
    _(extraPromiseNoChainMethods).keys().value()
  );

  var noExtraMethodCheck = function() {
    _(allExtraMethodNames).each(function(name) {
      should.not.exist(wd.Webdriver.prototype[name]);
      should.not.exist(wd.PromiseWebdriver.prototype[name]);
      should.not.exist(wd.PromiseChainWebdriver.prototype[name]);
    });
  };

  var partials = {};
  var express;

  before(function(done) {
    express = new Express( __dirname + '/assets' , partials);
    express.start(done);
  });

  beforeEach(function() {
    noExtraMethodCheck();
  });

  afterEach(function() {
    _(allExtraMethodNames).each(function(name) {
      wd.removeMethod(name);
    });
    noExtraMethodCheck();
  });

  after(function(done) {
    express.stop(done);
  });

  describe('promise chain', function() {

    var browser;

    function newPromiseChainRemote() {
      return wd.promiseChainRemote(env.REMOTE_CONFIG);
    }

    function initAndGet(that, desc) {
      var sauceExtra = {
        name: sauceJobTitle(that.runnable().parent.parent.title + ' ' + desc),
        tags: ['midway']
      };
      return browser
        .configureLogging()
        .init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null ))
        .get( midwayUrl(
          that.runnable().parent.parent.title,
          that.runnable().parent.title,
          that.runnable().title)
        );
    }

    afterEach(function() {
      var _this = this;
      return browser
        .quit().then(function() {
          if(env.SAUCE) { return(browser.sauceJobStatus(_this.currentTest.state === 'passed')); }
        });
    });

    partials['wd.addPromisedMethod (chain)'] =
      '<div id="theDiv">Hello World!</div>';
    it('wd.addPromisedMethod (chain)', function() {
      _(extraPromiseChainMethods).each(function(method, name) {
        wd.addPromiseChainMethod(name, method);
      });

      browser = newPromiseChainRemote();
      return initAndGet(this, 'pc/1').then(function() {
        return browser
          .sleepAndElementById('theDiv')
          .should.be.fulfilled
          .sleepAndText()
          .should.be.fulfilled
          .sleepAndElementById('theDiv')
          .sleepAndText().should.eventually.include("Hello World!");
      });
    });

    partials['wd.addPromisedMethod (no-chain)'] =
      '<div id="theDiv">Hello World!</div>';
    it('wd.addPromisedMethod (no-chain)', function() {
      _(extraPromiseNoChainMethods).each(function(method, name) {
        wd.addPromiseMethod(name, method);
      });

      browser = newPromiseChainRemote();
      return initAndGet(this, 'pc/2').then(function() {
        return browser
          .sleepAndElementById('theDiv')
          .should.be.fulfilled
          .sleepAndText()
          .should.be.fulfilled
          .sleepAndElementById('theDiv')
          .sleepAndText().should.eventually.include("Hello World!");
      });
    });

    partials['wd.addAsyncMethod'] =
      '<div id="theDiv">Hello World!</div>';
    it('wd.addAsyncMethod', function() {
      _(extraAsyncMethods).each(function(method, name) {
        wd.addAsyncMethod(name, method);
      });
      browser = newPromiseChainRemote();
      return initAndGet(this, 'pc/3').then(function() {
        return browser
          // .sleepAndElementById('theDiv')
          //   .should.be.fulfilled
          // .sleepAndText()
          //   .should.be.fulfilled
          // .sleepAndElementById('theDiv')
          // .sleepAndText().should.eventually.include("Hello World!")
          .elementByCssWhenReady('#theDiv', 500).text()
            .should.become("Hello World!");
      });
    });

  });

  describe('promise no-chain', function() {

    var browser;

    function newPromiseRemote() {
      return wd.promiseRemote(env.REMOTE_CONFIG);
    }

    function initAndGet(that, desc) {
      var sauceExtra = {
        name: sauceJobTitle(that.runnable().parent.parent.title + ' ' + desc),
        tags: ['midway']
      };
      return browser
        .configureLogging()
        .then(function() {
          return browser.init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null ));
        }).then(function() {
          return browser.get( midwayUrl(
            that.runnable().parent.parent.title,
            that.runnable().parent.title,
            that.runnable().title)
          );
        });
    }

    afterEach(function() {
      var _this = this;
      return browser
        .quit().then(function() {
          if(env.SAUCE) { return(browser.sauceJobStatus(_this.currentTest.state === 'passed')); }
        });
    });

    partials['wd.addPromisedMethod'] =
      '<div id="theDiv">Hello World!</div>';
    it('wd.addPromisedMethod', function() {
      _(extraPromiseNoChainMethods).each(function(method, name) {
        wd.addPromiseMethod(name, method);
      });

      browser = newPromiseRemote();
      return initAndGet(this, 'pnc/1').then(function() {
        return browser
          .sleepAndElementById('theDiv').should.be.fulfilled
          .then(function() {
            return browser.sleepAndText().should.be.fulfilled;
          }).then(function() {
            return browser.sleepAndElementById('theDiv');
          }).then(function(el){
            return browser.sleepAndText(el).should.become("Hello World!");
          });
      });
    });

    partials['wd.addAsyncMethod'] =
      '<div id="theDiv">Hello World!</div>';
    it('wd.addAsyncMethod', function() {
      _(extraAsyncMethods).each(function(method, name) {
        wd.addAsyncMethod(name, method);
      });
      browser = newPromiseRemote();
      return initAndGet(this, 'pnc/2').then(function() {
        return browser
          .sleepAndElementById('theDiv').should.be.fulfilled
          .then(function() {
            return browser.sleepAndText().should.be.fulfilled;
          }).then(function() {
            return browser.sleepAndElementById('theDiv');
          }).then(function(el){
            return browser.sleepAndText(el).should.become("Hello World!");
          });
      });
    });

  });

  describe('async', function() {

    var browser;

    function newRemote() {
      return wd.remote(env.REMOTE_CONFIG);
    }

    function initAndGet(that, desc, cb) {
      var sauceExtra = {
        name: sauceJobTitle(that.runnable().parent.parent.title + ' ' + desc),
        tags: ['midway']
      };
      browser.configureLogging(function(err) {
        if(err) { return cb(err); }
        browser.init(mergeDesired(env.DESIRED, env.SAUCE? sauceExtra : null) , function(err) {
          if(err) { return cb(err); }
          browser.get(
            midwayUrl(
              that.runnable().parent.parent.title,
              that.runnable().parent.title,
              that.runnable().title
            ),
            cb
          );
        });
      });
    }

    afterEach(function(done) {
      var _this = this;
      browser.quit(function(err) {
        if(err) { return done(err); }
        if(env.SAUCE)
          { browser.sauceJobStatus(_this.currentTest.state === 'passed', done); }
        else
          { done(); }
      });
    });

    partials['wd.addAsyncMethod'] =
      '<div id="theDiv">Hello World!</div>';
    it('wd.addAsyncMethod', function(done) {
      _(extraAsyncMethods).each(function(method, name) {
        wd.addAsyncMethod(name, method);
      });
      browser = newRemote();
      return initAndGet(this, 'a/1', function(err) {
        if(err) { return done(err); }
        browser.sleepAndElementById('theDiv', function(err, el) {
          if(err) { return done(err); }
          el.should.exist;
          browser.sleepAndText(el, function(err,text) {
            if(err) { return done(err); }
            text.should.equal('Hello World!');
            done();
          });
        });
      });
    });

  });

});
