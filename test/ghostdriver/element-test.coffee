# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/element-test-base'
{desired, remoteWdConfig} = require './config'

describe "wd", ->
  describe "ghostdriver", ->
    describe "element tests", ->

      describe "using ghostdriver", ->
        test remoteWdConfig, desired

