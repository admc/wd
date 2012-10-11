# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/typing-test-base'
{desired, remoteWdConfig} = require './config'

describe "wd", ->
  describe "ghostdriver", ->

    describe "typing test", ->
      
      describe "using chrome", ->
        test remoteWdConfig, desired
        
