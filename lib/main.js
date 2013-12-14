var __slice = Array.prototype.slice;
var url = require('url');
var SPECIAL_KEYS = require('./special-keys');
var Webdriver = require('./webdriver');
var Element = require('./element');
var utils = require('./utils');
var deprecator = utils.deprecator;
var config = require('./config');
var _ = require("./lodash");
var Q = require('q');

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
    if(args[0].href && args[0].format){
      // was constructed with url.parse, so we don't modify it
      config = args[0];
    } else {
      config = buildConfigUrl( args[0] );
    }
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

// Creates the Webdriver object
// server parameters can be passed in 4 ways
//   - as a url string
//   - as a url object, constructed via url.parse
//   - as a list of arguments host,port, user, pwd
//   - as an option object containing the fields above
// Optionally, a `driverType` string can be passed to
// create either promise or promiseChain drivers
function remote() {
  var _i;
  var args = 2 <= arguments.length ?
            __slice.call(arguments, 0, _i = arguments.length - 1)
            : (_i = 0, []);
  var driverType = arguments[_i++];
  var rwc = parseRemoteWdConfig(args);

  switch (driverType) {
    case 'promise':
      return new PromiseWebdriver(rwc);
    case 'promiseChain':
      return new PromiseChainWebdriver(rwc);
    default:
      return new Webdriver(rwc);
  }
}


var PromiseWebdriver, PromiseChainWebdriver;

function wrap() {
  PromiseWebdriver = require('./promise-webdriver')(Webdriver, Element, false);
  PromiseChainWebdriver = require('./promise-webdriver')(Webdriver, Element, true);
}

// todo: allow adding element methods

function addPromiseChainMethod(name, method) {
  var wrappedMethod = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    var promise = new Q(method.apply(this, args));
    this._enrich(promise);
    return promise;
  };
  PromiseChainWebdriver.prototype[name] = wrappedMethod;
}

function addPromiseMethod(name, method) {
  var wrappedMethod = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new Q(method.apply(this, args));
  };
  PromiseWebdriver.prototype[name] = wrappedMethod;
  addPromiseChainMethod(name, method);
}

function addAsyncMethod(name, method) {
  Webdriver.prototype[name] = method;
  PromiseWebdriver.prototype[name] = PromiseWebdriver._wrapAsync(method);
  PromiseChainWebdriver.prototype[name] = PromiseChainWebdriver._wrapAsync(method);
}

function removeMethod(name) {
  delete Webdriver.prototype[name];
  delete PromiseWebdriver.prototype[name];
  delete PromiseChainWebdriver.prototype[name];
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
  Webdriver: Webdriver,
  webdriver: Webdriver, // for backward compatibility
  Element: Element,
  PromiseChainWebdriver: PromiseChainWebdriver,
  PromiseWebdriver: PromiseWebdriver,

  // Actualizes promise wrappers
  rewrap: function() {
    deprecator.warn('rewrap',
    'rewrap has been deprecated, use addAsyncMethod instead.');
    wrap();
  },

  // config
  /**
   * wd.configureHttp(opts)
   *
   * opts example:
   * {timeout:60000, retries: 3, 'retryDelay': 15, baseUrl='http://example.com/'}
   * more info in README.
   *
   * @wd
   */
  configureHttp: config.configureHttp,
  getHttpConfig: function() { return _(config.httpConfig).clone(); },

  // deprecation
  /**
   * wd.showHideDeprecation(boolean)
   *
   * @wd
   */
  showHideDeprecation: deprecator.showHideDeprecation.bind(deprecator),

  // add/remove methods
  /**
   * wd.addAsyncMethod(name, func)
   *
   * @wd
   */
  addAsyncMethod: addAsyncMethod,
  /**
   * wd.addPromiseMethod(name, func)
   *
   * @wd
   */
  addPromiseMethod: addPromiseMethod,
  /**
   * wd.addPromiseChainMethod(name, func)
   *
   * @wd
   */
  addPromiseChainMethod: addPromiseChainMethod,
  /**
   * wd.removeMethod(name, func)
   *
   * @wd
   */
  removeMethod: removeMethod,

  // Useful stuff
  Asserter: require('./asserters').Asserter,
  asserters: require('./asserters'),
  SPECIAL_KEYS: SPECIAL_KEYS,
  Q: Q,
  findCallback: utils.findCallback,
  varargs: utils.varargs,
  transferPromiseness: utils.transferPromiseness,

  // This is for people who write wrapper
  // todo: That should not be needed.
  utils: utils,

  setBaseClasses: function(_Webdriver, _Element) {
    Webdriver = _Webdriver;
    Element = _Element;
    wrap();
  }
};
