# nodeunit test

wd = require '../../lib/main'
should = require 'should'
express = require 'express'
CoffeeScript = require 'coffee-script'      
async = require 'async'      

evalShouldEqual = (browser,formula,expected) ->  
  (done) ->  browser.eval formula, (err,res) ->
    should.not.exist err
    res.should.equal expected
    done(null)      

executeCoffee = (browser, script) ->  
  scriptAsJs = CoffeeScript.compile script, bare:'on'      
  (done) ->  browser.execute scriptAsJs, (err) ->
    should.not.exist err
    done(null)      

elementByCss = (browser,env,css,name) ->
  (done) -> browser.elementByCss css, (err, res) ->
    should.not.exist err
    env[name] = res
    done null     

textShouldEqual = (browser,element,expected, done) ->  
  browser.text element, (err,res) ->
    should.not.exist err
    res.should.equal expected
    done null      

valueShouldEqual = (browser,element,expected, done) ->  
  browser.getValue element, (err,res) ->
    should.not.exist err
    res.should.equal expected
    done null      
    
runTestWith = (remoteWdConfig, desired) -> 
  browser = null;  
  elementFunctionTests = () ->
    tests = {}
    tests.element = (test) ->      
      async.series [
        (done) ->
          browser.element "name", "elementByName", (err,res) ->
            should.not.exist err
            should.exist res
            done null
        (done) ->
          browser.element "name", "elementByName2", (err,res) ->
            should.exist err
            err.status.should.equal 7
            done null
      ], (err) ->
        should.not.exist err
        test.done()      

    tests.elementOrNull = (test) ->      
      async.series [
        (done) ->
          browser.elementOrNull "name", "elementByName", (err,res) ->
            should.not.exist err
            should.exist res
            done null
        (done) ->
          browser.elementOrNull "name", "elementByName2", (err,res) ->
            should.not.exist err
            (res is null).should.be.true
            done null
      ], (err) ->
        should.not.exist err
        test.done()      

    tests.elementIfExists = (test) ->      
      async.series [
        (done) ->
          browser.elementIfExists "name", "elementByName", (err,res) ->
            should.not.exist err
            should.exist res
            done null
        (done) ->
          browser.elementIfExists "name", "elementByName2", (err,res) ->
            should.not.exist err
            (res is undefined).should.be.true
            done null
      ], (err) ->
        should.not.exist err
        test.done()      
          
    tests.hasElement = (test) ->      
      async.series [
        (done) ->
          browser.hasElement "name", "elementByName", (err,res) ->
            should.not.exist err
            res.should.be.true
            done null
        (done) ->
          browser.hasElement "name", "elementByName2", (err,res) ->
            should.not.exist err
            res.should.be.false
            done null
      ], (err) ->
        should.not.exist err
        test.done()        

    tests.elements = (test) ->      
      async.series [
        (done) ->
          browser.elements "name", "elementsByName", (err,res) ->
            should.not.exist err
            res.should.have.length 3
            done null
        (done) ->
          browser.elements "name", "elementsByName2", (err,res) ->
            should.not.exist err
            res.should.eql []
            done null
      ], (err) ->
        should.not.exist err
        test.done()        

    for funcSuffix in [
      'ByClassName'
      , 'ByCssSelector' 
      , 'ById'
      , 'ByName' 
      , 'ByLinkText'
      , 'ByPartialLinkText'
      , 'ByTagName' 
      , 'ByXPath' 
      , 'ByCss'
    ]     
      do ->
        elementFuncName = 'element' + funcSuffix
        hasElementFuncName = 'hasElement' + funcSuffix
        elementsFuncName = 'elements' + funcSuffix

        searchText = elementFuncName;
        searchText = "click #{searchText}" if searchText.match /ByLinkText/
        searchText = "##{searchText}" if searchText.match /ByCss/
        searchText = "//div[@id='elementByXPath']/input" if searchText.match /ByXPath/
        searchText = "span" if searchText.match /ByTagName/
          
        searchText2 = elementFuncName + '2';
        searchText2 = "//div[@id='elementByXPath2']/input" if searchText.match /ByXPath/
        searchText2 = "span2" if searchText.match /ByTagName/
        
        searchSeveralText = searchText.replace('element','elements') 
        searchSeveralText2 = searchText2.replace('element','elements') 
        
        tests[elementFuncName] = (test) ->          		
          async.series [
            (done) ->
              browser[elementFuncName] searchText, (err,res) ->
                should.not.exist err
                should.exist res
                done null
            (done) ->
              browser[elementFuncName] searchText2  , (err,res) ->
                should.exist err
                err.status.should.equal 7
                done null
          ], (err) ->
            should.not.exist err
            test.done()        

        tests[elementFuncName + 'OrNull'] = (test) ->          		
          async.series [
            (done) ->
              browser[elementFuncName + 'OrNull'] searchText, (err,res) ->
                should.not.exist err
                should.exist res
                done null
            (done) ->
              browser[elementFuncName + 'OrNull'] searchText2  , (err,res) ->
                should.not.exist err
                (res is null).should.be.true
                done null
          ], (err) ->
            should.not.exist err
            test.done()        

        tests[elementFuncName + 'IfExists'] = (test) ->          		
          async.series [
            (done) ->
              browser[elementFuncName + 'IfExists'] searchText, (err,res) ->
                should.not.exist err
                should.exist res
                done null
            (done) ->
              browser[elementFuncName + 'IfExists'] searchText2  , (err,res) ->
                should.not.exist err
                (res is undefined).should.be.true
                done null
          ], (err) ->
            should.not.exist err
            test.done()        

        tests[hasElementFuncName] = (test) ->          		
          async.series [
            (done) ->
              browser[hasElementFuncName] searchText, (err,res) ->
                should.not.exist err
                res.should.be.true
                done null
            (done) ->
              browser[hasElementFuncName] searchText2  , (err,res) ->
                should.not.exist err
                res.should.be.false
                done null
          ], (err) ->
            should.not.exist err
            test.done()        
        
        tests[elementsFuncName] = (test) ->          		            
          async.series [
            (done) ->
              browser[elementsFuncName] searchSeveralText, (err,res) ->
                should.not.exist err
                unless(elementsFuncName.match /ByTagName/)
                  res.should.have.length 3
                else
                  (res.length > 1).should.be.true
                done null
            (done) ->
              browser[elementsFuncName] searchSeveralText2, (err,res) ->
                should.not.exist err
                res.should.eql []
                done null
          ], (err) ->
            should.not.exist err
            test.done()        
            
    tests

  {
    "wd.remote": (test) ->
      browser = wd.remote remoteWdConfig    
      browser.on "status", (info) ->
        console.log "\u001b[36m%s\u001b[0m", info
      browser.on "command", (meth, path) ->
        console.log " > \u001b[33m%s\u001b[0m: %s", meth, path
      test.done()
    
    "status": (test) ->
      browser.status (err,status) ->        
        should.not.exist err
        should.exist status
        test.done()

    "sessions": (test) ->
      browser.sessions (err,sessions) ->        
        should.not.exist err
        should.exist sessions
        test.done()

    "init": (test) ->
      browser.init desired, (err) ->
        should.not.exist err
        test.done()
    
    "sessionCapabilities": (test) ->
      browser.sessionCapabilities (err,capabilities) ->
        should.not.exist err
        should.exist capabilities
        should.exist capabilities.browserName
        should.exist capabilities.platform
        test.done()
  
        
    "altSessionCapabilities": (test) ->
      browser.altSessionCapabilities (err,capabilities) ->
        should.not.exist err
        should.exist capabilities
        should.exist capabilities.browserName
        should.exist capabilities.platform
        test.done()
  
    # would do with better test, but can't be bothered
    "setPageLoadTimeout": (test) ->
      browser.setPageLoadTimeout 500, (err) ->
        should.not.exist err
        test.done()
    
    "get": (test) ->
      browser.get "http://127.0.0.1:8181/test-page.html", (err) ->
        should.not.exist err
        test.done()
    
    "refresh": (test) ->
      browser.refresh (err) ->
        should.not.exist err
        test.done()

    "back / forward": (test) ->
      async.series [
        (done) ->
          browser.get "http://127.0.0.1:8181/test-page.html?p=2", (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.url (err, url) ->
            should.not.exist err            
            url.should.include "?p=2"
            done null
        (done) ->
          browser.back  (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.url (err, url) ->
            should.not.exist err            
            url.should.not.include "?p=2"
            done null
        (done) ->
          browser.forward  (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.url (err, url) ->
            should.not.exist err            
            url.should.include "?p=2"
            done null
        (done) ->
          browser.get "http://127.0.0.1:8181/test-page.html", (err) ->
            should.not.exist err
            done null
      ], (err) ->
        should.not.exist err
        test.done()
    
    "eval": (test) ->
      async.series [
        evalShouldEqual browser, "1+2", 3
        evalShouldEqual browser, "document.title", "TEST PAGE"
        evalShouldEqual browser, "$('#eval').length", 1
        evalShouldEqual browser, "$('#eval li').length", 2        
      ], (err) ->
        should.not.exist err
        test.done()

    "execute": (test) ->
      async.series [
        (done) ->  browser.execute "window.wd_sync_execute_test = 'It worked!'", (err) ->
          should.not.exist err
          done(null)      
        evalShouldEqual browser, "window.wd_sync_execute_test", 'It worked!'             
      ], (err) ->
        should.not.exist err
        test.done()        

    "executeAsync": (test) ->
      scriptAsCoffee =
        """
          [args...,done] = arguments
          done "OK"              
        """
      scriptAsJs = CoffeeScript.compile scriptAsCoffee, bare:'on'      
      browser.executeAsync scriptAsJs, (err,res) ->          
        should.not.exist err
        res.should.equal "OK"
        test.done()

        
    "setWaitTimeout / setImplicitWaitTimeout": (test) ->
      async.series [
        # using old name
        (done) -> browser.setWaitTimeout 0, (err) ->
          should.not.exist err
          done null     
        executeCoffee browser,   
          """
            setTimeout ->
              $('#setWaitTimeout').html '<div class="child">a child</div>'
            , 1000
          """
        (done) ->
          browser.elementByCss "#setWaitTimeout .child", (err,res) ->            
            should.exist err
            err.status.should.equal 7
            done(null)  
        (done) -> browser.setImplicitWaitTimeout 2000, (err) ->
          should.not.exist err
          done null             
        (done) ->
          browser.elementByCss "#setWaitTimeout .child", (err,res) ->            
            # now it works
            should.not.exist err
            should.exist res
            done(null)          
        (done) -> browser.setImplicitWaitTimeout 0, (err) ->
          should.not.exist err
          done null             
      ], (err) ->
        should.not.exist err
        test.done()        

      
    "setAsyncScriptTimeout": (test) ->
      async.series [
        (done) -> browser.setAsyncScriptTimeout 2000, (err) ->
          should.not.exist err
          done null     
        (done) -> 
          scriptAsCoffee =
            """
              [args...,done] = arguments
              setTimeout ->
                done "OK"
              , 1000
            """
          scriptAsJs = CoffeeScript.compile scriptAsCoffee, bare:'on'
          browser.executeAsync scriptAsJs, (err,res) ->          
            should.not.exist err
            res.should.equal "OK"
            done null
      ], (err) ->
        should.not.exist err
        test.done()        

    "element function tests": elementFunctionTests()
   
    "getAttribute": (test) -> 
      browser.elementById "getAttribute", (err,testDiv) ->
        should.not.exist err
        should.exist testDiv
        async.series [
          (done) ->
            browser.getAttribute testDiv, "weather", (err,res) ->
              should.not.exist err
              res.should.equal "sunny"
              done null
          (done) ->
            browser.getAttribute testDiv, "timezone", (err,res) ->
              should.not.exist err
              should.not.exist res
              done null
        ], (err) ->
          should.not.exist err
          test.done()        

    "getValue (input)": (test) -> 
      browser.elementByCss "#getValue input", (err,inputField) ->
        should.not.exist err
        should.exist inputField
        browser.getValue inputField, (err,res) ->
          should.not.exist err
          res.should.equal "Hello getValueTest!"
          test.done()        

    "getValue (textarea)": (test) -> 
      browser.elementByCss "#getValue textarea", (err,inputField) ->
        should.not.exist err
        should.exist inputField
        browser.getValue inputField, (err,res) ->
          should.not.exist err
          res.should.equal "Hello getValueTest2!"
          test.done()        

    "clickElement": (test) -> 
      browser.elementByCss "#clickElement a", (err,anchor) ->
        should.not.exist err
        should.exist anchor
        async.series [
          executeCoffee browser,
            '''
              jQuery ->
                a = $('#clickElement a')
                a.click ->
                  a.html 'clicked'              
            '''
          (done) -> textShouldEqual browser, anchor, "not clicked", done
          (done) ->
            browser.clickElement anchor, (err) ->
              should.not.exist err
              done null
          (done) -> textShouldEqual browser, anchor, "clicked", done
        ], (err) ->
          should.not.exist err
          test.done()        
    
    "moveTo": (test) -> 
      env = {}
      async.series [
        elementByCss browser, env, "#moveTo .a1", 'a1'
        elementByCss browser, env, "#moveTo .a2", 'a2'
        elementByCss browser, env, "#moveTo .current", 'current'        
        (done) -> textShouldEqual browser, env.current, '', done
        executeCoffee browser, 
          '''
            jQuery ->
              a1 = $('#moveTo .a1')
              a2 = $('#moveTo .a2')
              current = $('#moveTo .current')
              a1.hover ->
                current.html 'a1'
              a2.hover ->
                current.html 'a2'
          '''
        (done) -> textShouldEqual browser, env.current, '', done
        (done) ->
          browser.moveTo env.a1, 5, 5, (err) ->            
            should.not.exist err
            done null
        (done) -> textShouldEqual browser, env.current, 'a1', done
        (done) ->
          browser.moveTo env.a2, undefined, undefined, (err) ->
            should.not.exist err
            done null
        (done) -> textShouldEqual browser, env.current, 'a2', done        
        (done) ->
          browser.moveTo env.a1, (err) ->            
            should.not.exist err
            done null
        (done) -> textShouldEqual browser, env.current, 'a1', done
      ], (err) ->
        should.not.exist err
        test.done()        
    
    # @todo waiting for implementation
    # it "scroll", (test) ->
    
    "buttonDown / buttonUp": (test) -> 
      env = {}
      async.series [
        elementByCss browser, env, "#mouseButton a", 'a'
        elementByCss browser, env, "#mouseButton div", 'resDiv'
        executeCoffee browser, 
          '''
            jQuery ->
              a = $('#mouseButton a')
              resDiv = $('#mouseButton div')
              a.mousedown ->
                resDiv.html 'button down'
              a.mouseup ->
                resDiv.html 'button up'
          '''          
        (done) -> textShouldEqual browser, env.resDiv, '', done
        (done) ->
          browser.moveTo env.a, undefined, undefined, (err) ->            
            should.not.exist err
            done null
        (done) ->
          browser.buttonDown (err) ->            
            should.not.exist err
            done null
        (done) -> textShouldEqual browser, env.resDiv, 'button down', done
        (done) ->
          browser.buttonUp (err) ->            
            should.not.exist err
            done null
        (done) -> textShouldEqual browser, env.resDiv, 'button up', done
      ], (err) ->
        should.not.exist err
        test.done()        

    "click": (test) -> 
      browser.elementByCss "#click a", (err,anchor) ->
        should.not.exist err
        should.exist anchor
        async.series [
          executeCoffee browser,
            '''
              jQuery ->
                window.numOfClick = 0
                a = $('#click a')
                a.click ->
                  window.numOfClick = window.numOfClick + 1
                  a.html "clicked #{window.numOfClick}"              
            '''
          (done) -> textShouldEqual browser, anchor, "not clicked", done
          (done) ->
            browser.moveTo anchor, undefined, undefined, (err) ->
              should.not.exist err
              done null
          (done) ->
            browser.click 0, (err) ->
              should.not.exist err
              done null
          (done) -> textShouldEqual browser, anchor, "clicked 1", done
          (done) ->
            browser.moveTo anchor, undefined, undefined, (err) ->
              should.not.exist err
              done null
          (done) ->
            browser.click (err) ->
              should.not.exist err
              done null
          (done) -> textShouldEqual browser, anchor, "clicked 2", done
        ], (err) ->
          should.not.exist err
          test.done()        
    
    "doubleclick": (test) -> 
      browser.elementByCss "#doubleclick a", (err,anchor) ->
        should.not.exist err
        should.exist anchor
        async.series [
          executeCoffee browser,
            '''
              jQuery ->
                a = $('#doubleclick a')
                a.click ->
                  a.html 'doubleclicked'              
            '''
          (done) -> textShouldEqual browser, anchor, "not clicked", done
          (done) ->
            browser.moveTo anchor, undefined, undefined, (err) ->
              should.not.exist err
              done null
          (done) ->
            browser.doubleclick 0, (err) ->
              should.not.exist err
              done null
          (done) -> textShouldEqual browser, anchor, "doubleclicked", done
        ], (err) ->
          should.not.exist err
          test.done()        

    "type": (test) -> 
      browser.elementByCss "#type input", (err,inputField) ->
        should.not.exist err
        should.exist inputField
        async.series [
          (done) -> valueShouldEqual browser, inputField, "", done
          (done) ->
            browser.type inputField, "Hello World" , (err) ->
              should.not.exist err
              done null
          (done) -> valueShouldEqual browser, inputField, "Hello World", done
          (done) ->
            browser.type inputField, "\n" , (err) -> # no effect
              should.not.exist err
              done null
          (done) -> valueShouldEqual browser, inputField, "Hello World", done
        ], (err) ->
          should.not.exist err
          test.done()        

    "clear": (test) -> 
      browser.elementByCss "#clear input", (err,inputField) ->
        should.not.exist err
        should.exist inputField
        async.series [
          (done) -> valueShouldEqual browser, inputField, "not cleared", done
          (done) ->
            browser.clear inputField , (err) ->
              should.not.exist err
              done null
          (done) -> valueShouldEqual browser, inputField, "", done
        ], (err) ->
          should.not.exist err
          test.done()        

    "title": (test) -> 
      browser.title (err,title) ->
        should.not.exist err
        title.should.equal "TEST PAGE"
        test.done()        

    "text (passing element)": (test) -> 
      browser.elementByCss "#text", (err,textDiv) ->
        should.not.exist err
        should.exist textDiv
        browser.text textDiv, (err, res) ->
          should.not.exist err
          res.should.include "text content" 
          res.should.not.include "div" 
          test.done()        

    "text (passing undefined)": (test) -> 
      browser.text undefined, (err, res) ->
        should.not.exist err
        # the whole page text is returned
        res.should.include "text content" 
        res.should.include "sunny" 
        res.should.include "click elementsByLinkText"
        res.should.not.include "div" 
        test.done()        

    "text (passing body)": (test) -> 
      browser.text 'body', (err, res) ->
        should.not.exist err
        # the whole page text is returned
        res.should.include "text content" 
        res.should.include "sunny" 
        res.should.include "click elementsByLinkText"
        res.should.not.include "div" 
        test.done()        

    "text (passing null)": (test) -> 
      browser.text null, (err, res) ->
        should.not.exist err
        # the whole page text is returned
        res.should.include "text content" 
        res.should.include "sunny" 
        res.should.include "click elementsByLinkText"
        res.should.not.include "div" 
        test.done()        

    "textPresent": (test) -> 
      browser.elementByCss "#textPresent", (err,textDiv) ->
        should.not.exist err
        should.exist textDiv
        async.series [
          (done) -> 
            browser.textPresent 'sunny', textDiv , (err, res) ->
              should.not.exist err
              res.should.be.true
              done null
          (done) -> 
            browser.textPresent 'raining', textDiv , (err, res) ->
              should.not.exist err
              res.should.be.false
              done null
        ], (err) ->
          should.not.exist err
          test.done()        
    
    "acceptAlert": (test) -> 
      browser.elementByCss "#acceptAlert a", (err,a) ->
        should.not.exist err
        should.exist a
        async.series [
          executeCoffee browser,
            """
              jQuery ->            
                a = $('#acceptAlert a')
                a.click ->
                  alert "coffee is running out"
            """          
          (done) -> 
            browser.clickElement a, (err) ->
              should.not.exist err
              done null
          (done) -> 
            browser.acceptAlert (err) ->
              should.not.exist err
              done null
        ], (err) ->
          should.not.exist err
          test.done()        
    
    "dismissAlert": (test) ->       
      browser.elementByCss "#dismissAlert a", (err,a) ->
        should.not.exist err
        should.exist a
        capabilities = null;
        async.series [
          (done) -> 
            browser.sessionCapabilities (err,res) ->
              should.not.exist err
              capabilities = res
              done null              
          executeCoffee browser,
            """
              jQuery ->                        
                a = $('#dismissAlert a')
                a.click ->
                  alert "coffee is running out"
            """          
          (done) -> 
            browser.clickElement a, (err) ->
              should.not.exist err
              done null
          (done) -> 
            # known bug on chrome/mac, need to use acceptAlert instead
            unless (capabilities.platform is 'MAC' and capabilities.browserName is 'chrome')
              browser.dismissAlert (err) ->
                should.not.exist err
                done null
            else
              browser.acceptAlert (err) ->
                should.not.exist err
                done null            
        ], (err) ->
          should.not.exist err
          test.done()        
      
    "active": (test) -> 
      env = {}
      async.series [
        elementByCss browser, env, "#active .i1", 'i1'
        elementByCss browser, env, "#active .i2", 'i2'
        (done) ->
          browser.clickElement env.i1, (err) ->            
            should.not.exist err
            done null
        (done) ->
          browser.active (err,res) ->            
            should.not.exist err
            res.should.equal env.i1
            done null
        (done) ->
          browser.clickElement env.i2, (err) ->            
            should.not.exist err
            done null
        (done) ->
          browser.active (err,res) ->            
            should.not.exist err
            res.should.equal env.i2
            done null
      ], (err) ->
        should.not.exist err
        test.done()        
        
    "url": (test) ->
      browser.url (err,res) ->
        res.should.include "test-page.html"
        res.should.include "http://"
        test.done(); 
    
    "allCookies / setCookies / deleteAllCookies / deleteCookie": (test) -> 
      async.series [
        (done) ->
          browser.deleteAllCookies (err) ->            
            should.not.exist err
            done null            
        (done) ->
          browser.allCookies (err, res) ->            
            should.not.exist err
            res.should.eql []
            done null            
        (done) ->
          browser.setCookie \
            name: 'fruit1'
            , value: 'apple'
          , (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.allCookies (err, res) ->            
            should.not.exist err
            res.should.have.length 1
            (res.filter (c) -> c.name is 'fruit1' and c.value is 'apple')\
               .should.have.length 1
            done null            
        (done) ->
          browser.setCookie \
            name: 'fruit2'
            , value: 'pear'
          , (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.allCookies (err, res) ->            
            should.not.exist err
            res.should.have.length 2
            (res.filter (c) -> c.name is 'fruit2' and c.value is 'pear')\
               .should.have.length 1
            done null            
        (done) ->
          browser.setCookie \
            name: 'fruit3'
            , value: 'orange'
          , (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.allCookies (err, res) ->            
            should.not.exist err
            res.should.have.length 3
            done null            
        (done) ->
          browser.deleteCookie 'fruit2', (err) ->
            should.not.exist err
            done null
        (done) ->
          browser.allCookies (err, res) ->            
            should.not.exist err
            res.should.have.length 2
            (res.filter (c) -> c.name is 'fruit2' and c.value is 'pear')\
               .should.have.length 0
            done null            
        (done) ->
          browser.deleteAllCookies (err) ->            
            should.not.exist err
            done null            
        (done) ->
          browser.allCookies (err, res) ->            
            should.not.exist err
            res.should.eql []
            done null            
        (done) ->
          # not too sure how to test this case this one, so just making sure 
          # that it does not throw
          browser.setCookie \
            name: 'fruit3'
            , value: 'orange'
            , secure: true
          , (err) ->
            should.not.exist err
            done null
      ], (err) ->
        should.not.exist err
        test.done()        
    
    "quit": (test) ->        
      browser.quit ->
        test.done()
  }

app = null      

exports.wd =
  "per method test":    
    
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


