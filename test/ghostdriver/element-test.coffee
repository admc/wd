# mocha test

process.env.GHOSTDRIVER_TEST=1

{test} = require '../common/element-test-base'

describe "wd", ->
  describe "ghostdriver", ->
    describe "element tests", ->

      describe "using ghostdriver", ->
        test {host:'localhost', port:8080}, {}

