# mocha test

should = require 'should'

{Express} = require './express'

leakDetector = (require '../common/leak-detector')()
wd = require '../../lib/main'

test = (browserName) ->
  browser = null

  describe "wd.remote", -> 
    it "should create browser", (done) ->   
      browser = wd.remote {}
      browser.on "status", (info) ->
        console.log "\u001b[36m%s\u001b[0m", info
      browser.on "command", (meth, path) ->
        console.log " > \u001b[33m%s\u001b[0m: %s", meth, path   
      done null
    
  describe "init", ->
    it "should initialize browserinit", (done) ->
      @timeout 15000
      browser.init {browserName: browserName}, (err) ->
        should.not.exist err
        done null
  
  describe "get", ->
    it "should navigate to test page", (done) ->
      @timeout 10000
      browser.get "http://127.0.0.1:8181/element-test-page.html", (err) ->
        should.not.exist err
        done null
  
  describe "element.text", ->
    it "should retrieve the text", (done) ->
      browser.element "id", "text", (err, el) ->
        should.not.exist err
        el.should.have.property "text"
        el.text (err, res) ->
          res.should.include "I am some text"
          done null
  
  describe "element.textPresent", ->
    it "should check if text is present", (done) ->
      browser.element "id", "text", (err, el) ->
        should.not.exist err
        el.should.have.property "textPresent"
        el.textPresent "some text", (err, present) ->
          should.not.exist err
          present.should.be.true
          done null
  
  describe "element.getAttribute", ->
    it "should retrieve attribute value", (done) ->
      browser.element "id", "getAttribute", (err, el) ->
        should.not.exist err
        el.should.have.property "getAttribute"
        el.getAttribute "att", (err, value) ->
          should.not.exist err
          value.should.equal "42"
          done null

  describe "element.getValue", ->
    it "should retrieve value", (done) ->
      browser.element "id", "getValue", (err, el) ->
        should.not.exist err
        el.should.have.property "getValue"
        el.getValue (err, value) ->
          should.not.exist err
          value.should.equal "value"
          done null    

  describe "element.sendKeys", ->
    it "should send keys", (done) ->
      text = "keys"
      browser.element "id", "sendKeys", (err, el) ->
        should.not.exist err
        el.should.have.property "sendKeys"
        el.sendKeys text, (err) ->
          should.not.exist err
          el.getValue (err, textReceived) ->
            should.not.exist err
            textReceived.should.equal text
            done null

  describe "element.clear", ->
    it "should clear input field", (done) ->
      browser.element "id", "clear", (err, el) ->
        should.not.exist err
        el.should.have.property "clear"
        el.clear (err) ->
          should.not.exist err
          el.getValue (err, textReceived) ->
            should.not.exist err
            textReceived.should.equal ""
            done null

  describe "close", ->
    it "should close current window", (done) ->            
      browser.close (err) ->
        should.not.exist err
        done null
  
  describe "quit", ->  
    it "should destroy browser", (done) ->
      browser.quit (err) ->
        should.not.exist err
        done null

describe "wd", ->
  describe "unit", ->
    describe "element method tests", ->
      express = new Express
      before (done) ->
        express.start()
        done null
        
      after (done) ->
        express.stop()          
        done null

      describe "using chrome", ->
        test 'chrome'

      describe "using firefox", ->
        test 'firefox'
      
      leakDetector.lookForLeaks()

