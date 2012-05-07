# nodeunit test

wd = require '../../lib/main'
should = require 'should'
configHelper = require './config-helper' 

remoteWdConfig= configHelper.getRemoteWdConfig()

exports.wd =
  'browser init test':
    default: (test) ->
      browser = wd.remote remoteWdConfig
      browser.defaultCapabilities.should.eql { 
        browserName: 'firefox',
        version: '',
        javascriptEnabled: true,
        platform: 'VISTA' }
      browser.init (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'firefox'
          browser.quit (err) ->
            should.not.exist err
            test.done()
            
    'using browser.defaultCapabilities': (test) ->
      browser = wd.remote remoteWdConfig
      browser.defaultCapabilities.browserName = 'chrome'
      browser.defaultCapabilities.platform = 'LINUX'
      browser.defaultCapabilities.javascriptEnabled = false
      browser.defaultCapabilities.name = 'browser init using defaultCapabilities'
      browser.defaultCapabilities.tags = ['wd','test']
      browser.defaultCapabilities.should.eql { 
        browserName: 'chrome',
        version: '',
        javascriptEnabled: false,
        platform: 'LINUX',
        name: 'browser init using defaultCapabilities'
        tags: ['wd','test']
      }
      browser.init (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'chrome'
          capabilities.platform.should.equal 'LINUX'
          browser.quit (err) ->
            should.not.exist err
            test.done()
    
    'desired only': (test) ->
      browser = wd.remote remoteWdConfig
      browser.defaultCapabilities.should.eql { 
        browserName: 'firefox',
        version: '',
        javascriptEnabled: true,
        platform: 'VISTA' }
      desired =
        browserName:'iexplore' 
        platform: 'Windows 2008'
        name: 'browser init using desired'
        tags: ['wd','test']

      browser.init desired, (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.include 'explorer'
          capabilities.platform.should.equal 'WINDOWS'
          browser.quit (err) ->
            should.not.exist err
            test.done()

    'desired overiding defaultCapabilities': (test) ->
      browser = wd.remote remoteWdConfig
      browser.defaultCapabilities.browserName = 'chrome'
      browser.defaultCapabilities.name = 'browser init overide'
      browser.defaultCapabilities.tags = ['wd','test']  
      browser.defaultCapabilities.should.eql { 
        browserName: 'chrome',
        version: '',
        javascriptEnabled: true,
        platform: 'VISTA',
        name: 'browser init overide'
        tags: ['wd','test']
      }
      browser.init {browserName: 'firefox'}, (err) ->
        should.not.exist err
        browser.sessionCapabilities (err, capabilities) ->
          should.not.exist err
          capabilities.browserName.should.equal 'firefox'
          browser.quit (err) ->
            should.not.exist err
            test.done()



            
