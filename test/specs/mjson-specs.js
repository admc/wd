var nock = require('nock');
require('../helpers/setup');


describe("mjson tests", function() {

  var server, 
      requestFilter;

  before(function() {
    server = nock('http://localhost:5555').filteringRequestBody(/.*/, '*').persist();

    server.post('/session', '*').reply(303, "OK", {
      'Location': '/session/1234'
    });  
    server.post('/session/1234/element', '*')
    .reply(200, { 
      status: 0,
      sessionId: '1234',
      value: {ELEMENT: '0'},   
    });          
    server.post('/session/1234/elements', '*')
    .reply(200, { 
      status: 0,
      sessionId: '1234',
      value: [{ELEMENT: '0'}],   
    });    
    server.post('/session/1234/touch/perform', '*')
    .reply(200, { 
      status: 0,
      sessionId: '1234',
      // TODO check what the return is like
      value: [{'not sure': '0'}],   
    });   
    server.post('/session/1234/touch/multi/perform', '*')
    .reply(200, { 
      status: 0,
      sessionId: '1234',
      // TODO check what the return is like
      value: [{'not sure': '0'}],   
    });       
  });    
  
  describe("promise api", function() {
    var browser; 

    before(function(done) {
      browser = wd.promiseChainRemote('http://localhost:5555/');
      browser
        .init()
        .then(function() {
          server.filteringRequestBody(function(requestBody) {
            requestBody = JSON.parse(requestBody);
            if(requestFilter) { requestFilter(requestBody); }
            return "*";
          });
        })
        .nodeify(done);
    });

    describe("by ios uiautomation", function() {

      before(function() {
        requestFilter = function(requestBody) {
          requestBody.using.should.equal('-ios uiautomation');
        };
      });
      after(function() {
        requestFilter = null;
      });

      it("element methods should work", function(done) {
        browser
          .element('-ios uiautomation', 'random stuff')
            .should.eventually.exist
          .elementByIosUIAutomation('random stuff')
            .should.eventually.exist
          .elementByIosUIAutomationOrNull('random stuff')
            .should.eventually.exist
          .elementByIosUIAutomationIfExists('random stuff')
            .should.eventually.exist
          .hasElementByIosUIAutomation('random stuff')
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("elements methods should work", function(done) {
        browser
          .elements('-ios uiautomation', 'random stuff')
            .should.eventually.exist
          .elementsByIosUIAutomation('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

      it("wait methods should work", function(done) {
        browser
          .waitForElement('-ios uiautomation', 'random stuff')
            .should.eventually.exist
          .waitForElementByIosUIAutomation('random stuff')
            .should.eventually.exist
          .waitForElementsByIosUIAutomation('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

    });

    describe("by android uiautomator", function() {

      before(function() {
        requestFilter = function(requestBody) {
          requestBody.using.should.equal('-android uiautomator');
        };
      });
      after(function() {
        requestFilter = null;
      });

      it("element methods should work", function(done) {
        browser
          .element('-android uiautomator', 'random stuff')
            .should.eventually.exist
          .elementByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .elementByAndroidUIAutomatorOrNull('random stuff')
            .should.eventually.exist
          .elementByAndroidUIAutomatorIfExists('random stuff')
            .should.eventually.exist
          .hasElementByAndroidUIAutomator('random stuff')
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("elements methods should work", function(done) {
        browser
          .elements('-android uiautomator', 'random stuff')
            .should.eventually.exist
          .elementsByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

      it("wait methods should work", function(done) {
        browser
          .waitForElement('-android uiautomator', 'random stuff')
            .should.eventually.exist
          .waitForElementByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .waitForElementsByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

    });

    describe("by accessibility id", function() {

      before(function() {
        requestFilter = function(requestBody) {
          requestBody.using.should.equal('accessibility id');
        };
      });
      after(function() {
        requestFilter = null;
      });

      it("element methods should work", function(done) {      
        browser
          .element('accessibility id', 'random stuff')
            .should.eventually.exist
          .elementByAccessibilityId('random stuff')
            .should.eventually.exist
          .elementByAccessibilityIdOrNull('random stuff')
            .should.eventually.exist
          .elementByAccessibilityIdIfExists('random stuff')
            .should.eventually.exist
          .hasElementByAccessibilityId('random stuff')
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("elements methods should work", function(done) {
        browser
          .elements('accessibility id', 'random stuff')
            .should.eventually.exist
          .elementsByAccessibilityId('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

      it("wait methods should work", function(done) {
        browser
          .waitForElement('accessibility id', 'random stuff')
            .should.eventually.exist
          .waitForElementByAccessibilityId('random stuff')
            .should.eventually.exist
          .waitForElementsByAccessibilityId('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

    });

    describe("actions", function() {

      before(function() {
        requestFilter = function() {
        };
      });
      after(function() {
        requestFilter = null;
      });

      it("touch actions should work", function(done) {      
        browser
          .elementById('random')
          .then(function(el) {
            var action = new wd.TouchAction(el);
            var promise = action.tap().perform();
            promise.then.should.exist;
            return promise;
          }).nodeify(done);
      });

      it("multi actions should work", function(done) {      
        browser
          .elementById('random')
          .then(function(el) {
            var a1 = new wd.TouchAction(el).tap();
            var a2 = new wd.TouchAction(el).tap();
            var ma = new wd.MultiAction(el).add(a1, a2);
            var promise = ma.perform();
            promise.then.should.exist;
            return promise;
          }).nodeify(done);      
      });
    });
  });  
  describe("async callback api", function() {
    var browser;
    before(function(done) {
      browser = wd.remote('http://localhost:5555/');
      browser.init(function(err) {
        if(err) { return done(err); }
        server.filteringRequestBody(function(requestBody) {
          requestBody = JSON.parse(requestBody);
          if(requestFilter) { requestFilter(requestBody); }
          return "*";
          });
        done();    
      });
    });

    it("touch actions should work", function(done) {      
      browser.elementById('random', function(err, el) {
        should.not.exist(err);
        var action = new wd.TouchAction(el);
        action.tap().perform(function(err, res) {
          should.not.exist(err);
          res.should.exist;
          done();
        });
      });
    });

    it("multi actions should work", function(done) {      
      browser.elementById('random', function(err, el) {
        should.not.exist(err);
        var a1 = new wd.TouchAction(el).tap();
        var a2 = new wd.TouchAction(el).tap();
        var ma = new wd.MultiAction(el).add(a1, a2);
        ma.perform(function(err, res) {
          should.not.exist(err);
          res.should.exist;
          done();
        });
      });
    });

  });
});
