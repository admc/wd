# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/per-method-test-base'

describe "wd", ->
  describe "ghostdriver", ->
    describe "per method tests", ->
      
      describe "using ghostdriver", ->
        test {host:'localhost', port:8080}, {}
      
