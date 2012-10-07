# mocha test

{test} = require '../common/per-method-test-base'

describe "wd", ->
  describe "local", ->
    describe "per method tests", ->
      
      describe "using chrome", ->  
        test 'chrome'
        
      describe "using firefox", ->  
        test 'firefox'
      
