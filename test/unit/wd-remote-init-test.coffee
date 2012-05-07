# nodeunit test

wd = require '../../lib/main'
should = require 'should'

exports['remote initialization'] =
  default: (test) ->    
    browser = wd.remote()
    browser.options.host.should.equal '127.0.0.1'
    browser.options.port.should.equal 4444
    browser.options.path.should.equal '/wd/hub/session'
    should.not.exist browser.username 
    should.not.exist browser.accessKey
    test.done()

  params:      
    'host, port': (test) ->
      browser = wd.remote('localhost', 8888)
      browser.options.host.should.equal 'localhost'
      browser.options.port.should.equal 8888
      browser.options.path.should.equal '/wd/hub/session'
      should.not.exist browser.username 
      should.not.exist browser.accessKey        
      test.done()

    'host, port, username, accesskey': (test) ->
      browser = wd.remote('localhost', 8888 , 'mickey', 'mouse' )
      browser.options.host.should.equal 'localhost'
      browser.options.port.should.equal 8888
      browser.options.path.should.equal '/wd/hub/session'
      browser.username.should.equal 'mickey' 
      browser.accessKey.should.equal 'mouse'
      test.done()

  options:
    empty: (test) ->        
      browser = wd.remote( {} )
      browser.options.host.should.equal '127.0.0.1'
      browser.options.port.should.equal 4444
      browser.options.path.should.equal '/wd/hub/session'
      should.not.exist browser.username 
      should.not.exist browser.accessKey
      test.done()
    'host, port': (test) ->
      browser = wd.remote({host:'localhost', port:8888})
      browser.options.host.should.equal 'localhost'
      browser.options.port.should.equal 8888
      browser.options.path.should.equal '/wd/hub/session'
      should.not.exist browser.username 
      should.not.exist browser.accessKey        
      test.done()
    'host, port, username, accesskey': (test) ->
      browser = wd.remote({
        host:'localhost' 
        port:8888
        username:'mickey'
        accessKey:'mouse'        
      })
      browser = wd.remote('localhost', 8888 , 'mickey', 'mouse' )
      browser.options.host.should.equal 'localhost'
      browser.options.port.should.equal 8888
      browser.options.path.should.equal '/wd/hub/session'
      browser.username.should.equal 'mickey' 
      browser.accessKey.should.equal 'mouse'
      test.done()

      



            