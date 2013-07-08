var __slice = Array.prototype.slice;
var url = require('url');
var SPECIAL_KEYS = require('./special-keys');
var webdriver = require('./webdriver');
var promiseWebdriver = require('./promise-webdriver');

function buildConfigUrl(remoteWdConfig)
{
  var urlParts = [];
  urlParts.push( remoteWdConfig.https ? 'https://' : 'http://' );
  if(remoteWdConfig.username){
    var user = remoteWdConfig.username || process.env.SAUCE_USERNAME;
    var pwd = remoteWdConfig.accessKey  || process.env.SAUCE_ACCESS_KEY;
    urlParts.push( user + ':' + pwd + '@' );
  }
  urlParts.push( remoteWdConfig.host || '127.0.0.1' );
  urlParts.push( ':' );
  urlParts.push( remoteWdConfig.port || '4444' );
  urlParts.push( remoteWdConfig.path || '/wd/hub' );

  return url.parse(urlParts.join(''));
}

// parses server parameters
var parseRemoteWdConfig = function(args) {
  var config;
  if(args[0] instanceof url.Url){
    config = args[0]; 
  } else if ((typeof args[0]) === 'object') {
    config = buildConfigUrl( args[0] );
  } else if ((typeof args[0]) === 'string' && (args[0].match(/^https?:\/\//)))  {
    config = url.parse(args[0]);
  } else {
    config = buildConfigUrl( {
      host: args[0],
      port: args[1],
      username: args[2],
      accessKey: args[3]
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
