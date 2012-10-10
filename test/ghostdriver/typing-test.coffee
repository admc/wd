# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/typing-test-base'

describe "wd", ->
  describe "ghostdriver", ->

    describe "typing test", ->
      
      describe "using chrome", ->
        test {host:'localhost', port:8080},{}
        
