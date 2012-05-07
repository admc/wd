# nodeunit test

{runTestWith} = require '../common/basic-test-base'
configHelper = require './config-helper' 

remoteWdConfig= configHelper.getRemoteWdConfig()

nameBase = "saucelabs basic test - ";

chromeDesired =
  name: nameBase + 'chrome' 
  browserName:'chrome'
  
firefoxDesired =
  name: nameBase + 'firefox' 
  browserName:'firefox'

explorerDesired =
  name: nameBase + 'explorer' 
  browserName:'iexplore' 
  version:'9'
  platform:'Windows 2008'
  
exports.wd =  
      
  chrome: runTestWith( remoteWdConfig , chromeDesired)
    
  firefox: runTestWith(remoteWdConfig, firefoxDesired)

  explorer: runTestWith(remoteWdConfig, explorerDesired)

