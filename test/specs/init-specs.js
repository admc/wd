var nock = require('nock');
require('../helpers/setup');


describe("init tests", function() {

  describe("chromedriver initialized with string url", function() {

    var server, browser;

    before(function(done) {
      server = nock('http://localhost:9515').filteringRequestBody(/.*/, '*');
      server.log(console.log);
      server.post('/session', '*').reply(303, "OK", {
        'Location': '/session/1234'
      });
      browser = wd.remote('http://localhost:9515/');
      browser.init({}, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it("should get url", function(done) {
      server.post('/session/1234/url', '*').reply(200, "");
      browser.get("www.google.com", function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });

  describe("appium default", function() {

    var server, browser;

    it("should not have selenium defaults", function(done) {
      server = nock('http://localhost:4444');
      server.log(console.log);
      server
        .filteringRequestBody(function(requestBody) {
          requestBody = JSON.parse(requestBody);
          console.log(typeof requestBody);
          console.log(requestBody);          
          should.not.exist(requestBody.desiredCapabilities.javascriptEnabled);          
          done();
          return "*";
        })
        .post('/session', '*')
        .reply(303, "OK", { 'Location': '/session/1234' });
      browser = wd.remote('http://localhost:4444');
      browser.init({device: 'iPhone'}, function() {});      
    });
  });
});
