# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/per-method-test-base'
{desired, remoteWdConfig} = require './config'

describe "wd", ->
  describe "ghostdriver", ->
    describe "per method tests", ->
      
      describe "using ghostdriver", ->
        test remoteWdConfig, desired
      
