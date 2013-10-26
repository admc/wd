var testInfo = {
  name: "midway typing",
  tags: ['midway']
};

var setup = require('../helpers/setup');

var isBrowser = setup.isBrowser;

describe('typing test (' + setup.testEnv + ')', function() {

  var browser;
  var allPassed = true;
  var express = new setup.Express( __dirname + '/assets' );

  var altKey = wd.SPECIAL_KEYS.Alt;
  var nullKey = wd.SPECIAL_KEYS.NULL;
  var returnKey = wd.SPECIAL_KEYS.Return;
  var enterKey = wd.SPECIAL_KEYS.Enter;

  var typingPartial =
    '<div id="theDiv">\n' +
    '<input></input>\n' +
    '<textarea></textarea>\n' +
    '</div>\n';

  before(function() {
    express.start();
    return browser = setup.initBrowser(testInfo);
  });

  beforeEach(function() {
    var cleanTitle = this.currentTest.title.replace(/@[-\w]+/g, '').trim();
    return browser.get(
      'http://127.0.0.1:8181/test-page?partial=' +
        encodeURIComponent(cleanTitle));
  });

  afterEach(function() {
    allPassed = allPassed && (this.currentTest.state === 'passed');
  });

  after(function() {
    express.stop();
    return setup.closeBrowser();
  });

  after(function() {
    return setup.jobStatus(allPassed);
  });

  express.partials['typing nothing'] = typingPartial;
  it('typing nothing', function() {
    return browser
      .elementByCss("#theDiv input").type("").getValue().should.become("")
      .elementByCss("#theDiv textarea").type("").getValue().should.become("");
  });

  express.partials['typing []'] = typingPartial;
  it('typing []', function() {
    return browser
      .elementByCss("#theDiv input").type([]).getValue().should.become("")
      .elementByCss("#theDiv textarea").type([]).getValue().should.become("");
  });

  express.partials['typing \'Hello\''] = typingPartial;
  it('typing \'Hello\'', function() {
    return browser
      .elementByCss("#theDiv input").type('Hello')
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type('Hello')
        .getValue().should.become('Hello');
  });

  express.partials['typing [\'Hello\']'] = typingPartial;
  it('typing [\'Hello\']', function() {
    return browser
      .elementByCss("#theDiv input").type(['Hello']).getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type(['Hello']).getValue().should.become('Hello');
  });

  express.partials['typing [\'Hello\',\' \',\'World\',\'!\']'] = typingPartial;
  it('typing [\'Hello\',\' \',\'World\',\'!\']', function() {
    return browser
      .elementByCss("#theDiv input").type(['Hello', ' ', 'World', '!'])
        .getValue().should.become('Hello World!')
      .elementByCss("#theDiv textarea").type(['Hello', ' ', 'World', '!'])
        .getValue().should.become('Hello World!');
  });

  express.partials['typing \'Hello\\n\''] = typingPartial;
  it('typing \'Hello\\n\'', function() {
    return browser
      .elementByCss("#theDiv input").type('Hello\n')
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type('Hello\n')
        .getValue().should.become('Hello\n');
  });

  express.partials['typing \'\\r\''] = typingPartial;
  it('typing \'\\r\'', function() {
    return browser
      .elementByCss("#theDiv input").type(['Hello','\r'])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type(['Hello','\r'])
        .getValue().should.become( isBrowser('firefox')? 'Hello\n': 'Hello');
  });

  express.partials['typing [returnKey]'] = typingPartial;
  it('typing [returnKey]', function() {
    return browser
      .elementByCss("#theDiv input").type(['Hello', returnKey])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type(['Hello', returnKey])
        .getValue().should.become('Hello\n');
  });

  express.partials['typing [enterKey]'] = typingPartial;
  it('typing [enterKey]', function() {
    return browser
      .elementByCss("#theDiv input").type(['Hello', enterKey])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type(['Hello', enterKey])
        .getValue().should.become('Hello\n');
  });

  express.partials['typing [nullKey]'] = typingPartial;
  it('typing [nullKey]', function() {
    return browser
      .elementByCss("#theDiv input").type(['Hello', nullKey])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").type(['Hello', nullKey])
        .getValue().should.become('Hello');
  });


  if(!env.SAUCE) { // alt key seems to have no effect
    express.partials['typing [altKey]'] = typingPartial;
    it('typing [altKey]', function() {
      return browser
        .elementByCss("#theDiv input").type([altKey, 'Hello', altKey])
          .getValue().then(function(val) {
            val.should.exist;
            val.should.not.equal('Hello');
          })
        .elementByCss("#theDiv textarea").type([altKey, 'Hello', altKey])
          .getValue().then(function(val) {
            val.should.exist;
            val.should.not.equal('Hello');
          });
    });
  }

  if(!env.SAUCE) { // crashes selenium
    express.partials['keying nothing'] = typingPartial;
    it('keying nothing', function() {
      return browser
        .elementByCss("#theDiv input").click().keys('').getValue().should.become('')
        .elementByCss("#theDiv textarea").click().keys('').getValue().should.become('');
    });
  }

  express.partials['keying \'Hello\''] = typingPartial;
  it('keying \'Hello\'', function() {
    return browser
      .elementByCss("#theDiv input").click().keys('Hello')
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys('Hello')
        .getValue().should.become('Hello');
  });


  express.partials['keying [\'Hello\']'] = typingPartial;
  it('keying [\'Hello\']', function() {
    return browser
      .elementByCss("#theDiv input").click().keys(['Hello']).getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys(['Hello']).getValue().should.become('Hello');
  });

  express.partials['keying [\'Hello\',\' \',\'World\',\'!\']'] = typingPartial;
  it('keying [\'Hello\',\' \',\'World\',\'!\']', function() {
    return browser
      .elementByCss("#theDiv input").click().keys(['Hello', ' ', 'World', '!'])
        .getValue().should.become('Hello World!')
      .elementByCss("#theDiv textarea").click().keys(['Hello', ' ', 'World', '!'])
        .getValue().should.become('Hello World!');
  });

  express.partials['keying \'Hello\\n\''] = typingPartial;
  it('keying \'Hello\\n\'', function() {
    return browser
      .elementByCss("#theDiv input").click().keys('Hello\n')
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys('Hello\n')
        .getValue().should.become('Hello\n');
  });

  express.partials['keying \'\\r\''] = typingPartial;
  it('keying \'\\r\'', function() {
    return browser
      .elementByCss("#theDiv input").click().keys(['Hello','\r'])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys(['Hello','\r'])
        .getValue().should.become( isBrowser('firefox')? 'Hello\n': 'Hello');
  });

  express.partials['keying [returnKey]'] = typingPartial;
  it('keying [returnKey]', function() {
    return browser
      .elementByCss("#theDiv input").click().keys(['Hello', returnKey])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys(['Hello', returnKey])
        .getValue().should.become('Hello\n');
  });

  express.partials['keying [enterKey]'] = typingPartial;
  it('keying [enterKey]', function() {
    return browser
      .elementByCss("#theDiv input").click().keys(['Hello', enterKey])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys(['Hello', enterKey])
        .getValue().should.become('Hello\n');
  });

  express.partials['keying [nullKey]'] = typingPartial;
  it('keying [nullKey]', function() {
    return browser
      .elementByCss("#theDiv input").click().keys(['Hello', nullKey])
        .getValue().should.become('Hello')
      .elementByCss("#theDiv textarea").click().keys(['Hello', nullKey])
        .getValue().should.become('Hello');
  });

  if(!env.SAUCE) { // alt key seems to have no effect
    express.partials['keying [altKey]'] = typingPartial;
    it('keying [altKey]', function() {
      return browser
        .elementByCss("#theDiv input").click().keys([altKey, 'Hello', altKey])
          .getValue().then(function(val) {
            val.should.exist;
            val.should.not.equal('Hello');
          })
        .elementByCss("#theDiv textarea").click().keys([altKey, 'Hello', altKey])
          .getValue().then(function(val) {
            val.should.exist;
            val.should.not.equal('Hello');
          })
        ;
    });
  }
});
