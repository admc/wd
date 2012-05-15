var EventEmitter = require('events').EventEmitter
, __slice = Array.prototype.slice
, protocol = require('./protocol'),
SPECIAL_KEYS = require('./special-keys');

// webdriver client main class
// remoteWdConfig is an option object containing the following fields:
// host,port, username, accessKey
var webdriver = function(remoteWdConfig) {
  this.sessionID = null;
  this.username = remoteWdConfig.username;
  this.accessKey = remoteWdConfig.accessKey;
  this.basePath = (remoteWdConfig.path || '/wd/hub');
  // default
  this.options = {
    host: remoteWdConfig.host || '127.0.0.1'
    , port: remoteWdConfig.port || 4444
    , path: (this.basePath + '/session').replace('//', '/')
  };
  this.defaultCapabilities = {
    browserName: 'firefox'
    , version: ''
    , javascriptEnabled: true
, platform: 'ANY'
  };

  // saucelabs default
  if ((this.username != null) && (this.accessKey != null)) {
    this.defaultCapabilities.platform = 'VISTA';
  }

  EventEmitter.call(this);
};

// wraps protocol methods to hide implementation 
var wrap = function(f) {
  return function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return f.apply(this, args);
  };
};

// adding protocol methods
var k, v;
for (k in protocol) {
  v = protocol[k];
  if (typeof v === 'function') {
    webdriver.prototype[k] = wrap(v);
  }
}

webdriver.prototype.__proto__ = EventEmitter.prototype;

// parses server parameters
var parseRemoteWdConfig = function(args) {
  var accessKey, host, path, port, username, _ref;
  if (typeof (args != null ? args[0] : void 0) === 'object') {
    return args[0];
  } else {
    host = args[0], port = args[1], username = args[2], accessKey = args[3];
    return {
      host: host,
      port: port,
      username: username,
      accessKey: accessKey
    };

  }
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

exports.SPECIAL_KEYS = SPECIAL_KEYS

