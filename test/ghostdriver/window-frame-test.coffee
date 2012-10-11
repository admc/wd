# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/window-frame-test-base'
{desired, remoteWdConfig} = require './config'

describe "wd", ->
  describe "ghostdriver", ->

    describe "window frame test", ->
      
      describe "using ghostdriver", ->
        test remoteWdConfig, desired
        
