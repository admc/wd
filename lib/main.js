var __slice = Array.prototype.slice;
var url = require('url');
var SPECIAL_KEYS = require('./special-keys');
var Webdriver = require('./webdriver');
var utils = require('./utils');
var _ = require("lodash");
var Q = require('q');


var factory = exports.factory = {
  WebDriver: Webdriver
};

function buildConfigUrl(remoteWdConfig)
{
  var configUrl = _(remoteWdConfig).clone();

  // for backward compatibility
  if( configUrl.host && (configUrl.host.indexOf(':') < 0) && configUrl.port )
  {
    configUrl.hostname = configUrl.host;
    delete configUrl.host;
  }

  // for backward compatibility
  if(configUrl.username){
    configUrl.user = configUrl.username;
    delete configUrl.username;
  }

  // for backward compatibility
  if(configUrl.accessKey){
    configUrl.pwd = configUrl.accessKey;
    delete configUrl.accessKey;
  }

  // for backward compatibility
  if(configUrl.https){
    configUrl.protocol = 'https:';
    delete configUrl.https;
  }

  // for backward compatibility
  if(configUrl.path){
    configUrl.pathname = configUrl.path;
    delete configUrl.path;
  }

  // setting auth from user/password
  if(configUrl.user && configUrl.pwd){
    configUrl.auth = configUrl.user + ':' + configUrl.pwd;
    delete configUrl.user;
    delete configUrl.pwd;
  }

  _.defaults(configUrl, {
    protocol: 'http:',
    hostname: '127.0.0.1',
    port: '4444',
    pathname: '/wd/hub'
  });

  // strip any trailing slashes from pathname
  var parsed = url.parse(url.format(configUrl), true);
  if (parsed.pathname[parsed.pathname.length - 1] === '/') {
    parsed.pathname = parsed.pathname.slice(0, parsed.pathname.length - 1);
  }
  return parsed;
}

// parses server parameters
var parseRemoteWdConfig = function(args) {
  var config;
  if ((typeof args[0]) === 'object') {
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

  // saucelabs automatic config
  if( /saucelabs\.com/.exec(config.hostname) )
  {
    if(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY){
      config.auth = process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY;
    }
  }

  return config;
};

// creates the webdriver object
// server parameters can be passed in 4 ways
// - as a url string
// - as a url object, constructed via url.parse
// - as a list of arguments host,port, user, pwd
// - as an option object containing the fields above
function remote() {
  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  var rwc = parseRemoteWdConfig(args);

  return new factory.WebDriver(rwc);
}


var PromiseWebdriver, PromiseChainWebdriver;

function wrap() {
  PromiseWebdriver = require('./promise-webdriver')(factory.WebDriver, false);
  PromiseChainWebdriver = require('./promise-webdriver')(factory.WebDriver, true);
}

// creates a webdriver object using the Q promise wrap not chained
function promiseRemote() {
  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  var rwc = parseRemoteWdConfig(args);
  return new PromiseWebdriver(rwc);
}

// creates a webdriver object using the Q promise wrap chained
function promiseChainRemote() {
  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  var rwc = parseRemoteWdConfig(args);
  return new PromiseChainWebdriver(rwc);
}

// initial wrapping
wrap();

module.exports = {
  // Retrieves browser
  remote: remote,

  // Retrieves wrap browser
  promiseRemote: promiseRemote,
  promiseChainRemote: promiseChainRemote,

  // Webdriver and Wrapper base classes
  Webdriver: factory.WebDriver,
  webdriver: factory.WebDriver, // for backward compatibility
  PromiseChainWebdriver: PromiseChainWebdriver,
  PromiseWebdriver: PromiseWebdriver,

  // Actualizes promise wrappers
  rewrap: wrap,

  // Useful stuff
  SPECIAL_KEYS: SPECIAL_KEYS,
  Q: Q,
  findCallback: utils.findCallback,
  varargs: utils.varargs,
  transferPromiseness: utils.transferPromiseness,

  // This is for people who write wrapper
  // todo: That should not be needed.
  utils: utils

};
