should = require 'should'
wd = require '../../lib/main'
express = require 'express'

app = null      

runTestWith = (remoteWdConfig, desired) ->
  browser = null
  {
    "wd.remote": (test) ->
      browser = wd.remote remoteWdConfig
      browser.on "status", (info) ->
        console.log "\u001b[36m%s\u001b[0m", info
      browser.on "command", (meth, path) ->
        console.log " > \u001b[33m%s\u001b[0m: %s", meth, path   
      test.done()

    "init": (test) ->
      browser.init desired, (err) ->
        should.not.exist err
        test.done()

    "get": (test) ->
      browser.get "http://127.0.0.1:8181/element-test-page.html", (err) ->
        should.not.exist err
        test.done()

    "element.text": (test) ->
      browser.element "id", "text", (err, el) ->
        should.not.exist err
        el.should.have.property "text"
        el.text (err, res) ->
          res.should.include "I am some text"
          test.done()

    "element.textPresent": (test) ->
      browser.element "id", "text", (err, el) ->
        should.not.exist err
        el.should.have.property "textPresent"
        el.textPresent "some text", (err, present) ->
          should.not.exist err
          present.should.be.true
          test.done()

    "element.getAttribute": (test) ->
      browser.element "id", "getAttribute", (err, el) ->
        should.not.exist err
        el.should.have.property "getAttribute"
        el.getAttribute "att", (err, value) ->
          should.not.exist err
          value.should.equal "42"
          test.done()

    "element.getValue": (test) ->
      browser.element "id", "getValue", (err, el) ->
        should.not.exist err
        el.should.have.property "getValue"
        el.getValue (err, value) ->
          should.not.exist err
          value.should.equal "value"
          test.done()    

    "element.sendKeys": (test) ->
      text = "keys"
      browser.element "id", "sendKeys", (err, el) ->
        should.not.exist err
        el.should.have.property "sendKeys"
        el.sendKeys text, (err) ->
          should.not.exist err
          el.getValue (err, textReceived) ->
            should.not.exist err
            textReceived.should.equal text
            test.done()

    "element.clear": (test) ->
      browser.element "id", "clear", (err, el) ->
        should.not.exist err
        el.should.have.property "clear"
        el.clear (err) ->
          should.not.exist err
          el.getValue (err, textReceived) ->
            should.not.exist err
            textReceived.should.equal ""
            test.done()
            
    "close": (test) ->        
      browser.close (err) ->
        should.not.exist err
        test.done()
        
    "quit": (test) ->        
      browser.quit (err) ->
        should.not.exist err
        test.done()
  }


exports.wd =
  "per element method test":      
    'starting express': (test) ->
      app = express.createServer()
      app.use(express.static(__dirname + '/assets'));
      app.listen 8181
      test.done()
        
  chrome: (runTestWith {}, {browserName: 'chrome'})

  firefox: (runTestWith {}, {browserName: 'firefox'})

  'stopping express': (test) ->
    app.close()
    test.done()

