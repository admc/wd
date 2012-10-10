# mocha test

should = require 'should'
assert = require 'assert'

TIMEOUT = 60000

test = (remoteWdConfig, desired) ->  
  wd = require './wd-with-cov'

  remoteWdConfig = remoteWdConfig() if typeof remoteWdConfig is 'function'
    
  browser = null
  
  describe "remote", ->
    it "should create browser", (done) ->
      browser = wd.remote remoteWdConfig
      should.exist browser
      unless process.env.WD_COV?
        browser.on "status", (info) ->
          console.log "\u001b[36m%s\u001b[0m", info
        browser.on "command", (meth, path) ->
          console.log " > \u001b[33m%s\u001b[0m: %s", meth, path
      done null
    
  describe "init", ->
    it "should initialize browser", (done) ->
      @timeout TIMEOUT
      browser.init desired, ->
        done null

  describe "browsing", ->
    describe "getting page", ->
      it "should navigate to test page and check title", (done) ->
        @timeout TIMEOUT
        browser.get "http://saucelabs.com/test/guinea-pig", ->
          unless process.env.GHOSTDRIVER_TEST?
            browser.title (err, title) ->
              assert.ok ~title.indexOf("I am a page title - Sauce Labs"), "Wrong title!"
              done null
          else done null
  
    describe "clicking submit", ->
      it "submit element should be clicked", (done) ->
        @timeout TIMEOUT
        browser.elementById "submit", (err, el) ->
          browser.clickElement el, ->
            unless process.env.GHOSTDRIVER_TEST? 
              browser.eval "window.location.href", (err, location) ->
                assert.ok ~location.indexOf("#"), "Wrong title!"
                done null
            else done null
              
  describe "leaving", ->
    it "closing browser", (done) ->
      @timeout TIMEOUT
      browser.quit ->
        done null
        
exports.test = test

            
