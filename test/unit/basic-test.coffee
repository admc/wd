# nodeunit test

{runTestWith} = require '../common/basic-test'

exports.wd =
  'basic test':  
    chrome: (runTestWith {}, {browserName:'chrome'})
    
    firefox: (runTestWith {}, {browserName:'firefox'})




            