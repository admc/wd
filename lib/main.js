var __slice = Array.prototype.slice;
var url = require('url');
var SPECIAL_KEYS = require('./special-keys');
var webdriver = require('./webdriver');
var promiseWebdriver = require('./promise-webdriver');

function buildConfigUrl(remoteWdConfig)
{
  // for backward compatibility 
  if( remoteWdConfig.host && (remoteWdConfig.host.indexOf(':') < 0) && remoteWdConfig.port )
  {
    remoteWdConfig.hostname = remoteWdConfig.host;
    delete remoteWdConfig.host;
  }

  // for backward compatibility
  if(remoteWdConfig.username){
    remoteWdConfig.user = remoteWdConfig.username;
    delete remoteWdConfig.username;
  }

  // for backward compatibility
  if(remoteWdConfig.accessKey){
    remoteWdConfig.pwd = remoteWdConfig.accessKey;
    delete remoteWdConfig.accessKey;
  }

  // for backward compatibility
  if(remoteWdConfig.https){
    remoteWdConfig.protocol = 'https:';
    delete remoteWdConfig.https;
  }

  // saucelabs automatic config 
  if( (remoteWdConfig.host || remoteWdConfig.hostname || '').match(/saucelabs\.com/) )
  {
    remoteWdConfig.user = remoteWdConfig.user || process.env.SAUCE_USERNAME;
    remoteWdConfig.pwd = remoteWdConfig.pwd || process.env.SAUCE_ACCESS_KEY;
  }

  // setting auth from user/password
  if(remoteWdConfig.user && remoteWdConfig.pwd){
    remoteWdConfig.auth = remoteWdConfig.user + ':' + remoteWdConfig.pwd;
    delete remoteWdConfig.user;
    delete remoteWdConfig.pwd;
  }

  var urlParts = [];
  urlParts.push( remoteWdConfig.protocol || 'http:' , '//' );
  if(remoteWdConfig.auth){
    urlParts.push( remoteWdConfig.auth , '@' );
  }
  if(remoteWdConfig.host){
    urlParts.push( remoteWdConfig.host );
  } else{
    urlParts.push( 
      remoteWdConfig.hostname || '127.0.0.1', 
      ':',   
      remoteWdConfig.port || '4444' );
  } 
  urlParts.push( remoteWdConfig.path || '/wd/hub' );

  return url.parse(urlParts.join(''));
}

// parses server parameters
var parseRemoteWdConfig = function(args) {
  var config;
  if(args[0] && args[0].href){
    // we assume it is a url object
    config = args[0]; 
  } else if ((typeof args[0]) === 'object') {
    config = buildConfigUrl( args[0] );
  } else if ((typeof args[0]) === 'string' && (args[0].match(/^https?:\/\//)))  {
    config = url.parse(args[0]);
  } else {
    config = buildConfigUrl( {
      hostname: args[0],
      port: args[1],
      user: args[2],
      pwd: args[3]
    } );
  }
  return config;
};

// creates the webdriver object
// server parameters can be passed in 2 ways
// - as a list of arguments host,port, username, accessKey
// - as an option object containing the fields above
exports.remote = function() {
  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  var rwc = parseRemoteWdConfig(args);

  return new webdriver(rwc);
};


exports.promiseRemote = function() {
  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  var rwc = parseRemoteWdConfig(args);

  return new promiseWebdriver(rwc);
};


exports.SPECIAL_KEYS = SPECIAL_KEYS;
