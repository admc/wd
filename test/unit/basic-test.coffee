# nodeunit test
leakDetector = (require '../common/leak-detector')()

{runTestWith} = require '../common/basic-test-base'

exports.wd =
  'basic test':  
    chrome: (runTestWith {}, {browserName:'chrome'})
    
    firefox: (runTestWith {}, {browserName:'firefox'})

    'checking leaks': leakDetector.lookForLeaks

