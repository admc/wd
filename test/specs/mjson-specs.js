var nock = require('nock'),
    _ = require('lodash');
require('../helpers/setup');


describe("mjson tests", function() {

  var server, 
      browser, 
      requestFilter;

  before(function(done) {
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
    browser = wd.promiseChainRemote('http://localhost:5555/');
    browser
      .init()
      .then(function() {
        server.filteringRequestBody(function(requestBody) {
          requestBody = JSON.parse(requestBody);
          if(requestFilter) { requestFilter(requestBody); }
          return "*";
        })        
      })
      .nodeify(done);
  });    
    
  describe("by ios uiautomation", function() {

    before(function() {
      requestFilter = function(requestBody) {
        requestBody.using.should.equal('-ios uiautomation');
      };
    })
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
    })
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

});
