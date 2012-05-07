# nodeunit test

{runTestWith} = require '../common/basic-test-base'

exports.wd =
  'basic test':  
    chrome: (runTestWith {}, {browserName:'chrome'})
    
    firefox: (runTestWith {}, {browserName:'firefox'})




            