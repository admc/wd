# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/basic-test-base'

describe "wd", ->
  describe "ghostdriver", ->

    describe "basic test", ->
      
      describe "using ghostdriver", ->
        test {host:'localhost', port:8080}, {}
      
        
