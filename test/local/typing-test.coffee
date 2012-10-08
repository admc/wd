# mocha test

{test} = require '../common/typing-test-base'

describe "wd", ->
  describe "local", ->

    describe "typing test", ->
      
      describe "using chrome", ->
        test 'chrome'
      
      describe "using firefox", ->
        test 'firefox'
        
