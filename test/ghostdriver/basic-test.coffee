# mocha test

process.env.GHOSTDRIVER_TEST=true

{test} = require '../common/basic-test-base'

describe "wd", ->
  describe "local", ->

    describe "basic test", ->
      
      describe "using ghostdriver", ->
        test {host:'localhost', port:8080}, {}
      
        
