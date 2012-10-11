# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/basic-test-base'
{desired, remoteWdConfig} = require './config'

describe "wd", ->
  describe "ghostdriver", ->

    describe "basic test", ->
      
      describe "using ghostdriver", ->
        test remoteWdConfig, desired
      
        
