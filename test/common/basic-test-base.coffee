# mocha test

should = require 'should'
assert = require 'assert'

test = (remoteWdConfig, desired) ->  
  
  leakDetector = (require '../common/leak-detector')()
  wd = require '../../lib/main'

  remoteWdConfig = remoteWdConfig() if typeof remoteWdConfig is 'function'
    
  browser = null
  
  describe "remote", ->
    it "should create browser", (done) ->
      browser = wd.remote remoteWdConfig
      should.exist browser
      browser.on "status", (info) ->
        console.log "\u001b[36m%s\u001b[0m", info
      browser.on "command", (meth, path) ->
        console.log " > \u001b[33m%s\u001b[0m: %s", meth, path
      done null
    
  describe "init", ->
    it "should initialize browser", (done) ->
      @timeout 15000
      browser.init desired, ->
        done null

  describe "browsing", ->
    describe "getting page", ->        
      it "should navigate to test page and check title", (done) ->
        @timeout 15000
        browser.get "http://saucelabs.com/test/guinea-pig", ->
          browser.title (err, title) ->
            assert.ok ~title.indexOf("I am a page title - Sauce Labs"), "Wrong title!"
            done null
  
    describe "clicking submit", ->
      it "submit element should be clicked", (done) ->
        @timeout 15000
        browser.elementById "submit", (err, el) ->
          browser.clickElement el, ->
            browser.eval "window.location.href", (err, title) ->
              assert.ok ~title.indexOf("#"), "Wrong title!"
              done null
              
  describe "leaving", ->
    it "closing browser", (done) ->
      @timeout 15000
      browser.quit ->
        done null
    
  leakDetector.lookForLeaks()
    
exports.test = test

            