detector = ->
  _detector = require('gleak')()
  _detector.detectNew()

  _detector.lookForLeaks = (test) ->
    leaks = _detector.detectNew();      
    leaks.forEach (name) ->
      console.warn 'found global leak: %s', name
    leaks.should.have.length 0, 'leak detected'
    test.done()  

  _detector
module.exports = detector
