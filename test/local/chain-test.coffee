# mocha test

should = require 'should'
async = require 'async'      

wd = require '../common/wd-with-cov'

test = (browserName) ->
  browser = null

  describe "wd.remote", -> 
    it "should create browser", (done) ->   
      browser = wd.remote {}
      unless process.env.WD_COV?
        browser.on "status", (info) ->
          console.log "\u001b[36m%s\u001b[0m", info
        browser.on "command", (meth, path) ->
          console.log " > \u001b[33m%s\u001b[0m: %s", meth, path   
      done null

  describe "chaining", -> 
    it "should work", (done) ->
      browser
        .chain()
        .init
          browserName:'chrome'
          , tags : ["examples"]
          , name: "This is an example test"        
        .get( "http://saucelabs.com/test/guinea-pig" )
        .title (err, title) ->
          title.should.include 'I am a page title - Sauce Labs'
        .elementById 'submit', (err, el) ->
          # we should make clickElement not require a callback
          browser.clickElement el, (err) ->
            should.not.exist.err
        .eval "window.location.href", (err, href) ->
          href.should.include 'http'
        .quit (err) ->
          done null
        
describe "wd", ->
  describe "local", ->
    describe "chain tests", ->

      describe "using chrome", ->
        test 'chrome'

      describe "using firefox", ->
        test 'firefox'
      
