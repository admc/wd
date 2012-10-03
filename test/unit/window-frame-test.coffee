# mocha test

should = require 'should'

{Express} = require './express'

leakDetector = (require '../common/leak-detector')()
wd = require '../common/wd-with-cov'

test = (browserName) ->
  browser = null
  handles = {}
  
  describe "wd.remote", -> 
    it "should create browser", (done) ->   
      browser = wd.remote {}
      unless process.env.WD_COV?
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
  
  describe "opening first window", ->
    it "should open the first window", (done) ->
      @timeout 10000
      browser.get "http://127.0.0.1:8181/window-test-page.html?window_num=1", (err) ->
        should.not.exist err
        done null  
  
  describe "setting first window name", ->
    it "should set the window name", (done) ->
      browser.execute "window.name='window-1'", (err) ->
        should.not.exist err
        done null  

  describe "retrieving first window name", ->
    it "should be window-1", (done) ->
      browser.windowName (err, name) ->
        should.not.exist err
        name.should.equal 'window-1'
        done null  


  describe "retrieving first window handle", ->
    it "should retrieve handle", (done) ->
      browser.windowHandle (err, handle) ->
        should.not.exist err
        should.exist handle
        handle.length.should.be.above 0
        handles['window-1'] = handle
        done null  
            
  describe "opening second window", ->
    it "should open the second window", (done) ->
      @timeout 10000
      browser.execute "window.open('http://127.0.0.1:8181/window-test-page.html?window_num=2','window-2')", (err) ->
        should.not.exist err
        done null  

  describe "change focus to second window", ->
    it "should focus on second window", (done) ->
      browser.window 'window-2', (err) ->
        should.not.exist err
        browser.windowName (err, name) ->
          should.not.exist err
          name.should.equal 'window-2'
          done null  

  describe "retrieving second window handle", ->
    it "should retrieve handle", (done) ->
      browser.windowHandle (err, handle) ->
        should.not.exist err
        should.exist handle
        handle.length.should.be.above 0
        handle.should.not.equal handles['window-1']
        handles['window-2'] = handle        
        done null  

  describe "opening third window", ->
    it "should open the third window", (done) ->
      @timeout 10000
      browser.execute "window.open('http://127.0.0.1:8181/window-test-page.html?window_num=3','window-3')", (err) ->
        should.not.exist err
        done null  

  describe "change focus to third window", ->
    it "should focus on third window", (done) ->
      browser.window 'window-3', (err) ->
        should.not.exist err
        browser.windowName (err, name) ->
          should.not.exist err
          name.should.equal 'window-3'
          done null  

  describe "retrieving third window handle", ->
    it "should retrieve handle", (done) ->
      browser.windowHandle (err, handle) ->
        should.not.exist err
        should.exist handle
        handle.length.should.be.above 0
        handle.should.not.equal handles['window-1']
        handle.should.not.equal handles['window-2']
        handles['window-3'] = handle        
        done null  
  
  
  describe "windowHandles", ->
    it "should retrieve 2 window handles", (done) ->
      browser.windowHandles (err, _handles) ->
        should.not.exist err
        _handles.should.have.length 3
        for k,v in handles
          _handles.should.include v
        done null  

  describe "change focus to second window using window handle", ->
    it "should focus on second window", (done) ->
      browser.window handles['window-2'], (err) ->
        should.not.exist err
        browser.windowName (err, name) ->
          should.not.exist err
          name.should.equal 'window-2'
          done null      

  describe "closing second window", ->
    it "should close the second window", (done) ->
      browser.close (err) ->
        should.not.exist err
        browser.windowHandles (err, _handles) ->
          should.not.exist err
          _handles.should.have.length 2
          done null

  describe "change focus to third window", ->
    it "should focus on third window", (done) ->
      browser.window 'window-3', (err) ->
        should.not.exist err
        browser.windowName (err, name) ->
          should.not.exist err
          name.should.equal 'window-3'
          done null  

  describe "closing third window", ->
    it "should close the third window", (done) ->
      browser.close (err) ->
        should.not.exist err
        browser.windowHandles (err, _handles) ->
          should.not.exist err
          _handles.should.have.length 1
          done null

  describe "change focus to first window", ->
    it "should focus on first window", (done) ->
      browser.window 'window-1', (err) ->
        should.not.exist err
        browser.windowName (err, name) ->
          should.not.exist err
          name.should.equal 'window-1'
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
      
      leakDetector.lookForLeaks() unless process.env.WD_COV?

