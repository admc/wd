var url = require('url');
require('../helpers/setup');

describe("wd", function() {

  describe("global http settings", function() {
    it("should be able to configure http", function(done) {
      wd.httpConfig.should.exists;
      var current = wd.httpConfig;
      wd.configureHttp({timeout: 60000, retries: 3, 'retryDelay': 15});
      wd.httpConfig.should.deep.equal({timeout: 60000, retries: 3, 'retryDelay': 15});
      wd.configureHttp({timeout: 'default'});
      wd.httpConfig.should.deep.equal({timeout: undefined, retries: 3, 'retryDelay': 15});
      wd.configureHttp({retries: 'always'});
      wd.httpConfig.should.deep.equal({timeout: undefined, retries: 0, 'retryDelay': 15});
      wd.configureHttp({retries: 'never'});
      wd.httpConfig.should.deep.equal({timeout: undefined, retries: -1, 'retryDelay': 15});
      wd.httpConfig = current;
      done();
    });
  });
});
