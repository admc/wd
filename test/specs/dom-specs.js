require('../helpers/setup');

describe('config-dom', function () {

  describe('getDOMConfig', function () {
    it('has timeout defaulted to null', function () {
      wd.getDOMConfig().should.deep.equal({timeout: null});
    });

    describe('retrieved object', function () {
      it('is not passed through a reference', function () {
        config = wd.getDOMConfig();

        config.should.not.equal(wd.getDOMConfig());
      });

      it('mutating the retrieved object does not change the actual configuration', function () {
        wd.configureDOM({timeout: 2000});

        config = wd.getDOMConfig();
        config.timeout = 0;

        wd.getDOMConfig().timeout.should.equal(2000);
      });
    });
  });

  describe('configureDOM', function () {
    beforeEach(function () {
      wd.configureDOM({timeout: 5000});
    });

    it('allowes for overriding the defaults', function () {
      var DOMConfig = {timeout: 4000};

      wd.configureDOM(DOMConfig);

      wd.getDOMConfig().should.deep.equal(DOMConfig);
    });

    it('does not change the configuration when run with no arguments', function () {
      wd.configureDOM();

      wd.getDOMConfig().should.deep.equal({timeout: 5000});
    });

    it('does not change the configuration when run with an empty object', function () {
      wd.configureDOM({});

      wd.getDOMConfig().should.deep.equal({timeout: 5000});
    });
  });

});
