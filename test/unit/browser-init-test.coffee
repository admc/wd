# nodeunit test

wd = require '../../lib/main'
should = require 'should'
exports.wd =
  'browser init test':
    default: (test) ->
      browser = wd.remote()
      browser.defaultCapabilities.should.eql { 
        browserName: 'firefox',
        version: '',
        javascriptEnabled: true,
        platform: 'ANY' }
      browser.init (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'firefox'
          browser.quit (err) ->
            should.not.exist err
            test.done()

    'using browser.defaultCapabilities': (test) ->
      browser = wd.remote()
      browser.defaultCapabilities.browserName = 'chrome'
      browser.defaultCapabilities.javascriptEnabled = false
      browser.defaultCapabilities.should.eql { 
        browserName: 'chrome',
        version: '',
        javascriptEnabled: false,
        platform: 'ANY',
      }
      browser.init (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'chrome'
          browser.quit (err) ->
            should.not.exist err
            test.done()
  
  
    'desired only': (test) ->
      browser = wd.remote()
      browser.defaultCapabilities.should.eql { 
        browserName: 'firefox',
        version: '',
        javascriptEnabled: true,
        platform: 'ANY' }
      browser.init {browserName: 'chrome'}, (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'chrome'
          browser.quit (err) ->
            should.not.exist err
            test.done()

    'desired overiding defaultCapabilities': (test) ->
      browser = wd.remote()
      browser.defaultCapabilities.browserName = 'chrome'
      browser.defaultCapabilities.should.eql { 
        browserName: 'chrome',
        version: '',
        javascriptEnabled: true,
        platform: 'ANY' }
      browser.init {browserName: 'firefox'}, (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'firefox'
          browser.quit (err) ->
            should.not.exist err
            test.done()



            
