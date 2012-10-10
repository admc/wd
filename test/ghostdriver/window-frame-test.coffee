# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/window-frame-test-base'

describe "wd", ->
  describe "ghostdriver", ->

    describe "window frame test", ->
      
      describe "using ghostdriver", ->
        test {host:'localhost', port:8080}, {}
        
