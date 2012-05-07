# nodeunit test

wd = require '../../lib/main'
should = require 'should'
assert = require 'assert'

runTestWith = (remoteWdConfig, desired) ->  
  remoteWdConfig = remoteWdConfig() if typeof remoteWdConfig is 'function'
    
  browser = null
  {
    remote: (test) ->
      browser = wd.remote remoteWdConfig
      should.exist browser
      browser.on "status", (info) ->
        console.log "\u001b[36m%s\u001b[0m", info
      browser.on "command", (meth, path) ->
        console.log " > \u001b[33m%s\u001b[0m: %s", meth, path
      test.done()
    
    init: (test) ->
      browser.init desired, ->
        test.done()

    browsing: 
      'getting page': (test) ->
        browser.get "http://saucelabs.com/test/guinea-pig", ->
          browser.title (err, title) ->
            assert.ok ~title.indexOf("I am a page title - Sauce Labs"), "Wrong title!"
            test.done()
  
      clicking: (test) ->     
        browser.elementById "submit", (err, el) ->
          browser.clickElement el, ->
            browser.eval "window.location.href", (err, title) ->
              assert.ok ~title.indexOf("#"), "Wrong title!"
              test.done()    
              
    leaving: (test) ->
      browser.quit ->
        test.done()
  }
  
  
  
exports.runTestWith = runTestWith

            