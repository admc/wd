/* global sauceJobTitle, mergeDesired, midwayUrl, Express */

require('../helpers/setup');
var PromiseSimple = require('promise-simple');

describe('external-promises ' + env.ENV_DESC, function() {
  this.timeout(env.TIMEOUT);

  var extraMethods = {
    altSleep: function(ms) {
      var promise = PromiseSimple.defer();
      setTimeout(function() {
        promise.resolve();
      }, ms);
      return promise;
    } ,
    altSleepAndOk: function(ms) {
      return this
        .altSleep(ms)
        .then(function() {
          return 'OK';
        });
    } ,
    altSleepAndElementById: function(ms, id) {
      return this
        .altSleep(ms)
        .elementById(id);
    } ,
    elementByIdAndAltSleep: function(ms, id) {
      var _this = this;
      return this
        .elementById(id).then(function(el) {
          return _this.altSleep(200).thenResolve(el);
        });
    } ,
  };

  var noExtraMethodCheck = function() {
    _(extraMethods).keys().each(function(name) {
      should.not.exist(wd.PromiseChainWebdriver.prototype[name]);
    });
  };

  var express = new Express( __dirname + '/assets' );

  before(function() {
    express.start();
    wd.configureHttp(env.HTTP_CONFIG);
  });

  beforeEach(function() {
    noExtraMethodCheck();
  });
  
  afterEach(function() {
    _(extraMethods).keys().each(function(name) {
      wd.removeMethod(name);  
    });    
    noExtraMethodCheck();
  });

  after(function() {
    express.stop();
  });

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

  express.partials['addPromisedMethod (alt promise)'] =
    '<div id="theDiv">Hello World!</div>';
  it('addPromisedMethod (alt promise)', function() {
    _(extraMethods).each(function(method, name) {
      wd.addPromiseChainMethod(name, method);
    });
    
    browser = newPromiseChainRemote();
    return initAndGet(this, 'ap/1').then(function() {
      return browser
        .altSleep(100)
          .should.be.fulfilled
        .altSleepAndOk(100)
          .should.become('OK');
    });
  });

  express.partials['addPromisedMethod (mixed promise)'] =
    '<div id="theDiv">Hello World!</div>';
  it('addPromisedMethod (mixed promise)', function() {
    _(extraMethods).each(function(method, name) {
      wd.addPromiseChainMethod(name, method);
    });
    
    browser = newPromiseChainRemote();
    return initAndGet(this, 'ap/1').then(function() {
      return browser
        .altSleepAndElementById(100, 'theDiv')
          .should.be.fulfilled
        .altSleepAndElementById(100, 'theDiv')
        .text()
          .should.become("Hello World!")
        .elementByIdAndAltSleep(100, 'theDiv')
        .text()
          .should.become("Hello World!");
    });
  });

  express.partials['browser.resolve (alt promise)'] =
    '<div id="theDiv">Hello World!</div>';
  it('browser.resolve (alt promise)', function() {
    browser = newPromiseChainRemote();
    return initAndGet(this, 'ap/1').then(function() {
      return browser
        .resolve(extraMethods.altSleepAndOk())
        .should.become('OK')
        .noop()
        .should.be.fulfilled;
    });
  });

});
