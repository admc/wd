# mocha test

detector = ->
  _detector = require('gleak')()
  _detector.detectNew()

  _detector.lookForLeaks = (test) ->
    describe 'look for leaks', ->
      it "should not have leaks", (done) ->
        leaks = _detector.detectNew();      
        leaks.forEach (name) ->
          console.warn 'found global leak: %s', name
        leaks.should.have.length 0, 'leak detected'
        done null  
  _detector
module.exports = detector
