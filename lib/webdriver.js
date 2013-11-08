var EventEmitter = require('events').EventEmitter;
var _ = require("lodash");
var fs = require("fs");
var request = require('request');
var util = require( 'util' );
var url = require('url');
var path = require('path');

var __slice = Array.prototype.slice;
var utils = require("./utils");
var JSONWIRE_ERRORS = require('./jsonwire-errors.js');
var MAX_ERROR_LENGTH = 500;

// webdriver client main class
// configUrl: url object constructed via url.parse
var webdriver = module.exports = function(configUrl) {
  EventEmitter.call( this );
  this.sessionID = null;
  this.configUrl = configUrl;

  this.defaultCapabilities = {
    browserName: 'firefox'
     , version: ''
    , javascriptEnabled: true
    , platform: 'ANY'
  };
  // saucelabs default
  if (this.configUrl.auth) {
    this.defaultCapabilities.platform = 'VISTA';
  }

  this._httpConfig = {
    timeout: undefined,
    retries: 3,
    retryDelay: 15
  };
};

//inherit from EventEmitter
util.inherits( webdriver, EventEmitter );

// putting element class in prototype so it can easily be overridden
webdriver.prototype._Element = require('./element').element;

webdriver.prototype._buildInitUrl =function()
{
  var initUrl = _(this.configUrl).clone();
  initUrl.pathname += '/session';

  return url.parse(url.format(initUrl));
};

webdriver.prototype._buildJsonCallUrl = function(sessionID, relPath, absPath){
  var jsonCallUrl = _(this.configUrl).clone();

  delete jsonCallUrl.auth;

  var path = [jsonCallUrl.pathname, '/session'];
  if(sessionID)
    { path.push('/' , sessionID); }
  if(relPath)
    { path.push(relPath); }
  if(absPath)
    { path = [absPath]; }
  jsonCallUrl.pathname = path.join('');

  return url.parse(url.format(jsonCallUrl));
};

webdriver.prototype._getJsonwireError = function(status) {
  var jsonwireError = JSONWIRE_ERRORS.filter(function(err) {
    return err.status === status;
  });
  return ((jsonwireError.length>0) ? jsonwireError[0] : null);
};

webdriver.prototype._newError = function(opts)
{
  var err = new Error();
  _.each(opts, function(opt, k) {
    err[k] = opt;
  });
  // nicer error output
  err.inspect = function() {
    var jsonStr = JSON.stringify(err);
    return (jsonStr.length > MAX_ERROR_LENGTH)?
      jsonStr.substring(0,MAX_ERROR_LENGTH) + '...' : jsonStr;
  };
  return err;
};

webdriver.prototype._isWebDriverException = function(res) {
  return res &&
         res.class &&
         (res.class.indexOf('WebDriverException') > 0);
};

var cbStub = function() {};

// just calls the callback when there is no result
webdriver.prototype._simpleCallback = function(cb) {
  cb = cb || cbStub;
  var _this = this;
  return function(err, data) {
    if(err) { return cb(err); }
    if((data === '') || (data === 'OK')) {
      // expected behaviour when not returning JsonWire response
      cb(null);
    } else {
      // looking for JsonWire response
      var jsonWireRes;
      try{jsonWireRes = JSON.parse(data);}catch(ign){}
      if (jsonWireRes && (jsonWireRes.sessionId) && (jsonWireRes.status !== undefined)) {
        // valid JsonWire response
        if(jsonWireRes.status === 0) {
          cb(null);
        } else {
          var error = _this._newError(
            { message:'Error response status: ' + jsonWireRes.status +  '.'
              , status:jsonWireRes.status
              , cause:jsonWireRes });
          var jsonwireError  = _this._getJsonwireError(jsonWireRes.status);
          if(jsonwireError){ error['jsonwire-error'] = jsonwireError; }
          cb(error);
        }
      } else {
        // something wrong
        cb(_this._newError(
          {message:'Unexpected data in simpleCallback.', data: jsonWireRes || data}) );
      }
    }
  };
};

// base for all callback handling data
webdriver.prototype._callbackWithDataBase = function(cb) {
  cb = cb || cbStub;

  var _this = this;
  return function(err, data) {
    if(err) { return cb(err); }
    var obj,
        alertText;
    try {
      obj = JSON.parse(data);
    } catch (e) {
      return cb(_this._newError({message:'Not JSON response', data:data}));
    }
    try {
        alertText = obj.value.alert.text;
    } catch (e) {
        alertText = '';
    }
    if (obj.status > 0) {
      var error = _this._newError(
        { message:'Error response status: ' + obj.status + '. ' + alertText
          , status:obj.status
          , cause:obj });
      var jsonwireError  = _this._getJsonwireError(obj.status);
      if(jsonwireError){ error['jsonwire-error'] = jsonwireError; }
      cb(error);
    } else {
      cb(null, obj);
    }
  };
};

// retrieves field value from result
webdriver.prototype._callbackWithData = function(cb) {
  cb = cb || cbStub;
  var _this = this;
  return _this._callbackWithDataBase(function(err,obj) {
    if(err) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    // we might get a WebElement back as part of executeScript, so let's
    // check to make sure we convert if necessary to element objects
    if(obj.value !== null && typeof obj.value.ELEMENT !== "undefined") {
        obj.value = new _this._Element(obj.value.ELEMENT, _this);
    } else if (Object.prototype.toString.call(obj.value) === "[object Array]") {
        for (var i = 0; i < obj.value.length; i++) {
            if (obj.value[i] !== null && typeof obj.value[i].ELEMENT !== "undefined") {
                obj.value[i] = new _this._Element(obj.value[i].ELEMENT, _this);
            }
        }
    }
    cb(null, obj.value);
  });
};

// retrieves ONE element
webdriver.prototype._elementCallback = function(cb) {
  cb = cb || cbStub;
  var _this = this;
  return _this._callbackWithDataBase(function(err, obj) {
    if(err) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    if (!obj.value.ELEMENT) {
      cb(_this._newError(
        {message:"no ELEMENT in response value field.",cause:obj}));
    } else {
      var el = new _this._Element(obj.value.ELEMENT, _this);
      cb(null, el);
    }
  });
};

// retrieves SEVERAL elements
webdriver.prototype._elementsCallback = function(cb) {
  cb = cb || cbStub;
  var _this = this;
  return _this._callbackWithDataBase(function(err, obj) {
    //_this = this; TODO: not sure about this
    if(err) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    if (!(obj.value instanceof Array)) {return cb(_this._newError(
      {message:"Response value field is not an Array.", cause:obj.value}));}
    var i, elements = [];
    for (i = 0; i < obj.value.length; i++) {
      var el = new _this._Element(obj.value[i].ELEMENT, _this);
      elements.push(el);
    }
    cb(null, elements);
  });
};

webdriver.prototype._newHttpOpts = function(method) {
  var opts = {};

  opts.method = method;
  opts.headers = {};

  opts.headers.Connection = 'keep-alive';
  opts.timeout = this._httpConfig.timeout;

  // we need to check method here to cater for DELETE case
  if(opts.method === 'GET' || opts.method === 'POST'){
    opts.headers.Accept = 'application/json';
  }

  opts.prepareToSend = function(url, data) {
    this.url = url;
    if (opts.method === 'POST') {
      this.headers['Content-Type'] = 'application/json; charset=UTF-8';
      this.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
      this.body = data;
    }
  };
  return opts;
};

var strip = function strip(str) {
  if(typeof(str) !== 'string') { return str; }
  var x = [];
  _(str.length).times(function(i) {
    if (str.charCodeAt(i)) {
      x.push(str.charAt(i));
    }
  });
  return x.join('');
};

webdriver.prototype._request = function(httpOpts, cb, attempts) {
  var _this = this;
  request(httpOpts, function(err, res, data) {
    if(!attempts) { attempts = 1; }
    if( _this._httpConfig.retries >= 0 &&
      (_this._httpConfig.retries === 0 || (attempts -1) <= _this._httpConfig.retries) &&
      err && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
      _this.emit('http', 'Lost http connection (' + err.code +  '), retrying in' + _this._httpConfig.retryDelay + 'ms');
      setTimeout(function() {
        _this._request(httpOpts, cb, attempts + 1 );
      }, _this._httpConfig.retryDelay);
    } else {
      cb(err, res, data);
    }
  });
};

/**
 * init(desired, cb) -> cb(err, sessionID, capabilities)
 * Initialize the browser. capabilities return may be
 * absent, depending on driver.
 *
 * @jsonWire POST /session
 */
webdriver.prototype.init = function() {
  delete this.sessionID;
  var _this = this;
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      desired = fargs.all[0] || {};

  // copy containing defaults
  var _desired = _.clone(desired);
  _.defaults(_desired, this.defaultCapabilities);

  // http options
  var httpOpts = _this._newHttpOpts('POST');

  var url = this._buildInitUrl();

  // building request
  var data = JSON.stringify({desiredCapabilities: _desired});

  httpOpts.prepareToSend(url, data);

  this._request(httpOpts, function(err, res, data) {
    if(err) { return cb(err); }

    var resData;
    // retrieving session
    try{
      var jsonData = JSON.parse(data);
      if( jsonData.status === 0 ){
        _this.sessionID = jsonData.sessionId;
        resData = jsonData.value;
      }
    } catch(ignore){}
    if(!_this.sessionID){
      // attempting to retrieve the session the old way
      try{
        var locationArr = res.headers.location.replace(/\/$/, '').split('/');
        _this.sessionID = locationArr[locationArr.length - 1];
      } catch(ignore){}
    }

    if (_this.sessionID) {
      _this.emit('status', '\nDriving the web on session: ' + _this.sessionID + '\n');
      if (cb) { cb(null, _this.sessionID, resData); }
    } else {
      data = strip(data);
      if (cb) {
        err = new Error('The environment you requested was unavailable.');
        err.data = data;
        return cb(err);
      } else {
        console.error('\x1b[31mError\x1b[0m: The environment you requested was unavailable.\n');
        console.error('\x1b[33mReason\x1b[0m:\n');
        console.error(data);
        console.error('\nFor the available values please consult the WebDriver JSONWireProtocol,');
        console.error('located at: \x1b[33mhttp://code.google.com/p/selenium/wiki/JsonWireProtocol#/session\x1b[0m');
      }
    }
  });
};

// standard jsonwire call
webdriver.prototype._jsonWireCall = function(opts) {
  var _this = this;

  // http options init
  var httpOpts = this._newHttpOpts(opts.method);

  var url = this._buildJsonCallUrl(this.sessionID, opts.relPath, opts.absPath);

  // building callback
  var cb = opts.cb;
  if (opts.emit) {
    // wrapping cb if we need to emit a message
    var _cb = cb;
    cb = function() {
      var args = __slice.call(arguments, 0);
      _this.emit(opts.emit.event, opts.emit.message);
      if (_cb) { _cb.apply(_this,args); }
    };
  }

  // logging
  _this.emit('command', httpOpts.method,
    url.path.replace(this.sessionID, ':sessionID')
      .replace(this.configUrl.pathname, ''), opts.data
    );

  // writting data
  var data = opts.data || {};
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  httpOpts.prepareToSend(url, data);
  // building request
  this._request(httpOpts, function(err, res, data) {
    if(err) { return cb(err); }
    data = strip(data);
    cb(null, data || "");
  });
};

// convert code to string before execution
webdriver.prototype._codeToString = function(code) {
  if(typeof code === 'function') {
    code = 'return (' + code + ').apply(null, arguments);';
  }
  return code;
};

// small helper to make sure we don't loose exceptions
// use this instead of looking  the last argument manually
var findCallback = utils.findCallback;

/**
 * status(cb) -> cb(err, status)
 *
 * @jsonWire GET /status
 */
webdriver.prototype.status = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , absPath: this.configUrl.pathname + '/status'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * sessions(cb) -> cb(err, sessions)
 *
 * @jsonWire GET /sessions
 */
webdriver.prototype.sessions = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , absPath: this.configUrl.pathname + '/sessions'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * Retrieves the current session id.
 * getSessionId(cb) -> cb(err, sessionId)
 * getSessionId()
 */
webdriver.prototype.getSessionId = function() {
  var cb = findCallback(arguments);
  if(cb) { cb(null, this.sessionID); }
  return this.sessionID;
};

webdriver.prototype.getSessionID = webdriver.prototype.getSessionId;

webdriver.prototype.chain = function(obj){
  if(this.warnDeprecated) {
    console.warn("chain api has been deprecated, use promise chain instead.");
  }
  require("./deprecated-chain").patch(this);
  return this.chain(obj);
};

/**
 * Alternate strategy to get session capabilities from server session list:
 * altSessionCapabilities(cb) -> cb(err, capabilities)
 *
 * @jsonWire GET /sessions
 */
webdriver.prototype.altSessionCapabilities = function() {
  var cb = findCallback(arguments);
  var _this = this;
  // looking for the current session
  _this.sessions.apply(this, [function(err, sessions) {
    if(err) {
      cb(err, sessions);
    } else {
      sessions = sessions.filter(function(session) {
        return session.id === _this.sessionID;
      });
      cb(null, sessions[0]? sessions[0].capabilities : 0);
    }
  }]);
};

/**
 * sessionCapabilities(cb) -> cb(err, capabilities)
 *
 * @jsonWire GET /session/:sessionId
 */
webdriver.prototype.sessionCapabilities = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    // default url
    , cb: this._callbackWithData(cb)
  });
};

/**
 * Opens a new window (using Javascript window.open):
 * newWindow(url, name, cb) -> cb(err)
 * newWindow(url, cb) -> cb(err)
 * name: optional window name
 * Window can later be accessed by name with the window method,
 * or by getting the last handle returned by the windowHandles method.
 */
webdriver.prototype.newWindow = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      url =  fargs.all[0],
      name = fargs.all[1];
  this.execute("var url=arguments[0], name=arguments[1]; window.open(url, name);", [url,name] , cb);
};

/**
 * close(cb) -> cb(err)
 *
 * @jsonWire DELETE /session/:sessionId/window
 */
webdriver.prototype.close = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'DELETE'
    , relPath: '/window'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * window(name, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/window
 */
webdriver.prototype.window = function(windowRef) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/window'
    , cb: this._simpleCallback(cb)
    , data: { name: windowRef }
  });
};

/**
 * frame(frameRef, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/frame
 */
webdriver.prototype.frame = function(frameRef) {
  var cb = findCallback(arguments);
  // avoid using this, webdriver seems very buggy
  // doesn't work at all with chromedriver
  if(typeof(frameRef) === 'function'){
    frameRef = null;
  }
  if(frameRef !== null && typeof(frameRef.value) !== "undefined"){
    // we have an element object
    frameRef = {ELEMENT: frameRef.value};
  }
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/frame'
    , cb: this._simpleCallback(cb)
    , data: { id: frameRef }
  });
};

/**
 * windowName(cb) -> cb(err, name)
 */
webdriver.prototype.windowName = function() {
  var cb = findCallback(arguments);
  // jshint evil: true
  this.eval("window.name", cb);
};

/**
 * windowHandle(cb) -> cb(err, handle)
 *
 * @jsonWire GET /session/:sessionId/window_handle
 */
webdriver.prototype.windowHandle = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/window_handle'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * windowHandles(cb) -> cb(err, arrayOfHandles)
 *
 * @jsonWire GET /session/:sessionId/window_handles
 */
webdriver.prototype.windowHandles = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/window_handles'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * logTypes(cb) -> cb(err, arrayOfLogTypes)
 *
 * @jsonWire GET /session/:sessionId/log/types
 */
webdriver.prototype.logTypes = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/log/types'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * log(logType, cb) -> cb(err, arrayOfLogs)
 *
 * @jsonWire POST /session/:sessionId/log
 */
webdriver.prototype.log = function(logType) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/log'
    , cb: this._callbackWithData(cb)
    , data: { type: logType }
  });
};

/**
 * quit(cb) -> cb(err)
 * Destroy the browser.
 *
 * @jsonWire DELETE /session/:sessionId
 */
webdriver.prototype.quit = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'DELETE'
    // default url
    , emit: {event: 'status', message: '\nEnding your web drivage..\n'}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * Evaluate expression (using execute):
 * eval(code, cb) -> cb(err, value)
 *
 * @jsonWire POST /session/:sessionId/execute
 */
(function() {
  // jshint evil: true
  webdriver.prototype.eval = function(code) {
    var cb = findCallback(arguments);
    code = this._codeToString(code);
    code = "return " + code + ";";
    this.execute.apply( this, [code, function(err, res) {
      if(err) {return cb(err);}
      cb(null, res);
    }]);
  };
})();

/**
 * Safely evaluate expression, always returning  (using safeExecute):
 * safeEval(code, cb) -> cb(err, value)
 *
 * @jsonWire POST /session/:sessionId/execute
 */
webdriver.prototype.safeEval = function(code) {
  var cb = findCallback(arguments);
  code = this._codeToString(code);
  this.safeExecute.apply( this, [code, function(err, res) {
    if(err) {return cb(err);}
    cb(null, res);
  }]);
};

/**
 * execute(code, args, cb) -> cb(err, result)
 * execute(code, cb) -> cb(err, result)
 * args: script argument array (optional)
 *
 * @jsonWire POST /session/:sessionId/execute
 * @docOrder 1
 */
webdriver.prototype.execute = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      code = fargs.all[0],
      args = fargs.all[1] || [];
  code = this._codeToString(code);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute'
    , cb: this._callbackWithData(cb)
    , data: {script: code, args: args}
  });
};

// script to be executed in browser
var safeExecuteJsScript = fs.readFileSync( __dirname + "/../browser-scripts/safe-execute.js", 'utf8');

/**
 * Safely execute script within an eval block, always returning:
 * safeExecute(code, args, cb) -> cb(err, result)
 * safeExecute(code, cb) -> cb(err, result)
 * args: script argument array (optional)
 *
 * @jsonWire POST /session/:sessionId/execute
 * @docOrder 2
 */
webdriver.prototype.safeExecute = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      code = fargs.all[0],
      args = fargs.all[1] || [];

  code = this._codeToString(code);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute'
    , cb: this._callbackWithData(cb)
    , data: {script: safeExecuteJsScript, args: [code, args]}
  });
};

/**
 * executeAsync(code, args, cb) -> cb(err, result)
 * executeAsync(code, cb) -> cb(err, result)
 * args: script argument array (optional)
 *
 * @jsonWire POST /session/:sessionId/execute_async
 */
webdriver.prototype.executeAsync = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      code = fargs.all[0],
      args = fargs.all[1] || [];

  code = this._codeToString(code);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute_async'
    , cb: this._callbackWithData(cb)
    , data: {script: code, args: args}
  });
};

// script to be executed in browser
var safeExecuteAsyncJsScript = fs.readFileSync( __dirname + "/../browser-scripts/safe-execute-async.js", 'utf8');

/**
 * Safely execute async script within an eval block, always returning:
 * safeExecuteAsync(code, args, cb) -> cb(err, result)
 * safeExecuteAsync(code, cb) -> cb(err, result)
 * args: script argument array (optional)
 *
 * @jsonWire POST /session/:sessionId/execute_async
 */
webdriver.prototype.safeExecuteAsync = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      code = fargs.all[0],
      args = fargs.all[1] || [];

  code = this._codeToString(code);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute_async'
    , cb: this._callbackWithData(cb)
    , data: {script: safeExecuteAsyncJsScript , args: [code, args]}
  });
};

/**
 * get(url,cb) -> cb(err)
 * Get a new url.
 *
 * @jsonWire POST /session/:sessionId/url
 */
webdriver.prototype.get = function(url) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/url'
    , data: {'url': url}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * refresh(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/refresh
 */
webdriver.prototype.refresh = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/refresh'
    , cb: this._simpleCallback(cb)
  });
};

/**
  * maximize(handle, cb) -> cb(err)
  *
  * @jsonWire POST /session/:sessionId/window/:windowHandle/maximize
 */
webdriver.prototype.maximize = function(win) {
var cb = findCallback(arguments);
this._jsonWireCall({
	method: 'POST'
	, relPath: '/window/'+ win + '/maximize'
	, cb: this._simpleCallback(cb)
	});
};

/**
  * windowSize(handle, width, height, cb) -> cb(err)
  *
  * @jsonWire POST /session/:sessionId/window/:windowHandle/size
 */
webdriver.prototype.windowSize = function(win, width, height) {
var cb = findCallback(arguments);
this._jsonWireCall({
  method: 'POST'
  , relPath: '/window/'+ win + '/size'
  , data: {'width':width, 'height':height}
  , cb: this._simpleCallback(cb)
  });
};

/**
  * getWindowSize(handle, cb) -> cb(err, size)
  * getWindowSize(cb) -> cb(err, size)
  * handle: window handle to get size (optional, default: 'current')
  *
  * @jsonWire GET /session/:sessionId/window/:windowHandle/size
 */
webdriver.prototype.getWindowSize = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      win = fargs.all[0] || 'current';
this._jsonWireCall({
	method: 'GET'
	, relPath: '/window/'+ win + '/size'
	, cb: this._callbackWithData(cb)
	});
};

/**
  * setWindowSize(width, height, handle, cb) -> cb(err)
  * setWindowSize(width, height, cb) -> cb(err)
  * width: width in pixels to set size to
  * height: height in pixels to set size to
  * handle: window handle to set size for (optional, default: 'current')
  * @jsonWire POST /session/:sessionId/window/:windowHandle/size
 */
webdriver.prototype.setWindowSize = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      width = fargs.all[0],
      height = fargs.all[1],
      win = fargs.all[2] || 'current';
this._jsonWireCall({
	method: 'POST'
	, relPath: '/window/'+ win + '/size'
    , cb: this._simpleCallback(cb)
    , data: {width: width, height: height}
	});
};

/**
  * getWindowPosition(handle, cb) -> cb(err, position)
  * getWindowPosition(cb) -> cb(err, position)
  * handle: window handle to get position (optional, default: 'current')
  *
  * @jsonWire GET /session/:sessionId/window/:windowHandle/position
 */
webdriver.prototype.getWindowPosition = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      win = fargs.all[0] || 'current';
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/window/'+ win + '/position'
    , cb: this._callbackWithData(cb)
    });
};

/**
  * setWindowPosition(x, y, handle, cb) -> cb(err)
  * setWindowPosition(x, y, cb) -> cb(err)
  * x: the x-coordinate in pixels to set the window position
  * y: the y-coordinate in pixels to set the window position
  * handle: window handle to set position for (optional, default: 'current')
  * @jsonWire POST /session/:sessionId/window/:windowHandle/position
 */
webdriver.prototype.setWindowPosition = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      x = fargs.all[0],
      y = fargs.all[1],
      win = fargs.all[2] || 'current';
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/window/'+ win + '/position'
    , cb: this._simpleCallback(cb)
    , data: {x: x, y: y}
  });
};

/**
 * forward(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/forward
 */
webdriver.prototype.forward = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/forward'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * back(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/back
 */
webdriver.prototype.back = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/back'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * setHttpTimeout(ms, cb) --> cb(err);
 * setHttpTimeout(ms)
 * ms: http request completion timeout.
 * more info in README.
 */
webdriver.prototype.setHttpTimeout = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      ms = fargs.all[0];
  this.configureHttp( {timeout: ms}, cb );
};

webdriver.prototype.setHTTPInactivityTimeout = webdriver.prototype.setHttpTimeout;

/**
 * configureHttp(opts, cb) --> cb(err);
 * configureHttp(opts)
 * opts example:
 * {timeout:60000, retries: 3, 'retry-timeout': 15}
 * more info in README.
 */
webdriver.prototype.configureHttp = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      opts = fargs.all[0];
  _(_.keys(this._httpConfig)).intersection(_.keys(opts)).each(function(key) {
    switch(key) {
      case 'timeout':
        if(opts[key] === 'default') { opts[key] = undefined; }
      break;
      case 'retries':
        if(opts[key] === 'always') { opts[key] = 0; }
        if(opts[key] === 'none') { opts[key] = -1; }
      break;
    }
    this._httpConfig[key] = opts[key];
  }, this);
  if(cb) { cb(null); }
};

/**
 * setImplicitWaitTimeout(ms, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/timeouts/implicit_wait
 */
webdriver.prototype.setImplicitWaitTimeout = function(ms) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/timeouts/implicit_wait'
    , data: {ms: ms}
    , cb: this._simpleCallback(cb)
  });
};

// for backward compatibility
webdriver.prototype.setWaitTimeout = webdriver.prototype.setImplicitWaitTimeout;

/**
 * setAsyncScriptTimeout(ms, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/timeouts/async_script
 */
webdriver.prototype.setAsyncScriptTimeout = function(ms) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/timeouts/async_script'
    , data: {ms: ms}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * setPageLoadTimeout(ms, cb) -> cb(err)
 * (use setImplicitWaitTimeout and setAsyncScriptTimeout to set the other timeouts)
 *
 * @jsonWire POST /session/:sessionId/timeouts
 */
webdriver.prototype.setPageLoadTimeout = function(ms) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/timeouts'
    , data: {type: 'page load', ms: ms}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * element(using, value, cb) -> cb(err, element)
 *
 * @jsonWire POST /session/:sessionId/element
 */
webdriver.prototype.element = function(using, value) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element'
    , data: {using: using, value: value}
    , cb: this._elementCallback(cb)
  });
};

/**
 * Retrieve an element avoiding not found exception and returning null instead:
 * elementOrNull(using, value, cb) -> cb(err, element)
 *
 * @jsonWire POST /session/:sessionId/elements
 * @docOrder 3
 */
webdriver.prototype.elementOrNull = function(using, value) {
  var cb = findCallback(arguments);
  this.elements.apply(this, [using, value,
    function(err, elements) {
      if(!err) {
        if(elements.length>0) {cb(null,elements[0]);} else {cb(null,null);}
      } else {
        cb(err); }
    }
  ]);
};

/**
 * Retrieve an element avoiding not found exception and returning undefined instead:
 * elementIfExists(using, value, cb) -> cb(err, element)
 *
 * @jsonWire POST /session/:sessionId/elements
 * @docOrder 5
 */
webdriver.prototype.elementIfExists = function(using, value) {
  var cb = findCallback(arguments);
  this.elements.apply(this, [using, value,
    function(err, elements) {
      if(!err) {
        if(elements.length>0) {cb(null,elements[0]);} else {cb(null);}
      } else {
        cb(err); }
    }
  ]);
};

/**
 * elements(using, value, cb) -> cb(err, elements)
 *
 * @jsonWire POST /session/:sessionId/elements
 * @docOrder 1
 */
webdriver.prototype.elements = function(using, value) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/elements'
    , data: {using: using, value: value}
    , cb: this._elementsCallback(cb)
  });
};

/**
 * Check if element exists:
 * hasElement(using, value, cb) -> cb(err, boolean)
 *
 * @jsonWire POST /session/:sessionId/elements
 * @docOrder 7
 */
webdriver.prototype.hasElement = function(using, value){
  var cb = findCallback(arguments);
  this.elements.apply( this, [using, value, function(err, elements){
    if(!err) {
      cb(null, elements.length > 0 );
    } else {
      cb(err); }
  }]);
};

/**
 * waitFor(asserter, timeout, pollFreq, cb) -> cb(err, return_value)
 * timeout and pollFreq are optional (default 1000ms/200ms)
 * waitFor(opts, cb) -> cb(err)
 * opts with the following fields: timeout, pollFreq, asserter.
 * asserter like: function(browser , cb) -> cb(err, satisfied, return_value)
 */
webdriver.prototype._waitFor = function(){

  var cb = findCallback(arguments);
  var fargs = utils.varargs(arguments);
  var opts;
  // retrieving options
  if(typeof fargs.all[0] === 'object'){
    opts = fargs.all[0];
  } else
  {
    opts = {
      asserter: fargs.all[0],
      timeout: fargs.all[1],
      pollFreq: fargs.all[2]
    };
  }

  // default
  opts.timeout = opts.timeout || 1000;
  opts.pollFreq = opts.pollFreq || 200;

  if(!opts.asserter) { throw new Error('Missing asserter!'); }

  var _this = this;
  var endTime = Date.now() + opts.timeout;

  var unpromisedAsserter = function(browser, cb) {
    var promise = opts.asserter(browser, cb);
    if(promise && promise.then && typeof promise.then === 'function'){
      promise.then(
        function(res) { cb(null, true, res); },
        function(err) {
          if(err.retriable) { cb(null, false); }
          else { throw err; }
        }
      );
    }
  };

  function poll(){
    unpromisedAsserter(_this, function(err, satisfied, value) {
      if(err) { return cb(err); }
      if(satisfied) {
        cb(null, value);
      } else {
        if(Date.now() > endTime){
          cb(new Error("Condition wasn't satisfied!"));
        } else {
          setTimeout(poll, opts.pollFreq);
        }
      }
    });
  }

  poll();
};
webdriver.prototype.waitFor = webdriver.prototype._waitFor;

/**
 * waitForElement(using, value, asserter, timeout, pollFreq, cb) -> cb(err)
 * waitForElement(using, value, timeout, pollFreq, cb) -> cb(err)
 * timeout and pollFreq are optional (default 1000ms/200ms)
 * waitForElement(using, value, opts, cb) -> cb(err)
 * opts with the following fields: timeout, pollFreq, asserter.
 * asserter like: function(element , cb) -> cb(err, satisfied)
 */
webdriver.prototype._waitForElement = function(){

  var cb = findCallback(arguments);
  var fargs = utils.varargs(arguments);
  var using = fargs.all[0],
      value = fargs.all[1];
  var opts;

  // retrieving options
  switch( typeof fargs.all[2] ){
    case 'object':
      opts = fargs.all[2];
      break;
    case 'function':
      opts = {
        asserter: fargs.all[2],
        timeout: fargs.all[3],
        pollFreq: fargs.all[4]
      };
      break;
    default:
      opts = {
        timeout: fargs.all[2],
        pollFreq: fargs.all[3]
      };
  }
  // default
  opts.asserter = opts.asserter || function(el, cb) { cb(null, true); };

  var unpromisedAsserter = function(el, cb) {
    var promise = opts.asserter(el, cb);
    if(promise && promise.then && typeof promise.then === 'function'){
      promise.then(
        function() { cb(null, true); },
        function(err) {
          if(err.retriable) { cb(null, false); }
          else { throw err; }
        }
      );
    }
  };

  var wrappedAsserter = function(browser, cb){
    browser.elements(using, value, function(err, els){
      if(err) { return cb(err); }
      if(els.length > 0){
        unpromisedAsserter(els[0], function(err, satisfied) {
          if(err) { return cb(err); }
          cb(err, satisfied, satisfied? els[0]: undefined);
        });
      }
      else
        { cb(null, false); }
    });
  };


  this._waitFor(
    {
      asserter: wrappedAsserter,
      timeout: opts.timeout,
      pollFreq: opts.pollFreq
    }, function(err, value) {
      if(err && err.message && err.message.match(/Condition/)) {
        cb(new Error("Element condition wasn't satisfied!"));
      } else {
        cb(err, value);
      }
    });
};
webdriver.prototype.waitForElement = webdriver.prototype._waitForElement;

/**
 * waitForVisible(using, value, timeout, cb) -> cb(err)
 */
webdriver.prototype._waitForVisible = function(using, value, timeout) {
  var cb = findCallback(arguments);
  var _this = this;
  var endTime = Date.now() + timeout;

  var poll = function(){
    _this.isVisible(using, value, function(err, visible) {
      if (err) {
        return cb(err);
      }

      if (visible) {
        cb(null);
      } else {
        if (Date.now() > endTime) {
          cb(new Error("Element didn't become visible"));
        } else {
          setTimeout(poll, 200);
        }
      }
    });
  };
  poll();
};
webdriver.prototype.waitForVisible = webdriver.prototype._waitForVisible;

/**
 * waitForNotVisible(using, value, timeout, cb) -> cb(err)
 */
webdriver.prototype.waitForNotVisible = function(using, value, timeout) {
  var cb = findCallback(arguments);
  var _this = this;
  var endTime = Date.now() + timeout;

  var poll = function(){
    _this.isVisible(using, value, function(err, visible) {
      if (err) {
        return cb(err);
      }

      if (!visible) {
        cb(null);
      } else {
        if (Date.now() > endTime) {
          cb(new Error("Element didn't become visible"));
        } else {
          setTimeout(poll, 200);
        }
      }
    });
  };
  poll();
};

/**
 * takeScreenshot(cb) -> cb(err, screenshot)
 *
 * @jsonWire GET /session/:sessionId/screenshot
 */
webdriver.prototype.takeScreenshot = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/screenshot'
    , cb: this._callbackWithData(cb)
  });
};

// adding all elementBy... , elementsBy... function

webdriver.prototype._buildBySuffixMethods = function(type, prototype, singular, plural) {
  if(singular){
    /**
     * elementByClassName(value, cb) -> cb(err, element)
     * elementByCssSelector(value, cb) -> cb(err, element)
     * elementById(value, cb) -> cb(err, element)
     * elementByName(value, cb) -> cb(err, element)
     * elementByLinkText(value, cb) -> cb(err, element)
     * elementByPartialLinkText(value, cb) -> cb(err, element)
     * elementByTagName(value, cb) -> cb(err, element)
     * elementByXPath(value, cb) -> cb(err, element)
     * elementByCss(value, cb) -> cb(err, element)
     *
     * @jsonWire POST /session/:sessionId/element
     */
    prototype['element' + utils.elFuncSuffix(type)] = function() {
      var args = __slice.call(arguments, 0);
      args.unshift(utils.elFuncFullType(type));
      this.element.apply(this, args);
    };

    /**
     * elementByClassNameOrNull(value, cb) -> cb(err, element)
     * elementByCssSelectorOrNull(value, cb) -> cb(err, element)
     * elementByIdOrNull(value, cb) -> cb(err, element)
     * elementByNameOrNull(value, cb) -> cb(err, element)
     * elementByLinkTextOrNull(value, cb) -> cb(err, element)
     * elementByPartialLinkTextOrNull(value, cb) -> cb(err, element)
     * elementByTagNameOrNull(value, cb) -> cb(err, element)
     * elementByXPathOrNull(value, cb) -> cb(err, element)
     * elementByCssOrNull(value, cb) -> cb(err, element)
     *
     * @jsonWire POST /session/:sessionId/elements
     * @docOrder 4
     */
    prototype['element' + utils.elFuncSuffix(type)+ 'OrNull'] = function() {
      var fargs = utils.varargs(arguments);
      var cb = fargs.callback;
      var args = fargs.all;
      args.unshift(utils.elFuncFullType(type));
      args.push(
        function(err, elements) {
          if(!err) {
            if(elements.length>0) {cb(null,elements[0]);} else {cb(null,null);}
          } else {
            cb(err);
          }
        }
      );
      this.elements.apply(this, args );
    };

    /**
     * elementByClassNameIfExists(value, cb) -> cb(err, element)
     * elementByCssSelectorIfExists(value, cb) -> cb(err, element)
     * elementByIdIfExists(value, cb) -> cb(err, element)
     * elementByNameIfExists(value, cb) -> cb(err, element)
     * elementByLinkTextIfExists(value, cb) -> cb(err, element)
     * elementByPartialLinkTextIfExists(value, cb) -> cb(err, element)
     * elementByTagNameIfExists(value, cb) -> cb(err, element)
     * elementByXPathIfExists(value, cb) -> cb(err, element)
     * elementByCssIfExists(value, cb) -> cb(err, element)
     *
     * @jsonWire POST /session/:sessionId/elements
     * @docOrder 6
     */
    prototype['element' + utils.elFuncSuffix(type)+ 'IfExists'] = function() {
      var fargs = utils.varargs(arguments);
      var cb = fargs.callback;
      var args = fargs.all;
      args.unshift(utils.elFuncFullType(type));
      args.push(
        function(err, elements) {
          if(!err) {
            if(elements.length>0) {cb(null,elements[0]);} else {cb(null);}
          } else {
            cb(err); }
        }
      );
      this.elements.apply(this, args);
    };

    /**
     * hasElementByClassName(value, cb) -> cb(err, boolean)
     * hasElementByCssSelector(value, cb) -> cb(err, boolean)
     * hasElementById(value, cb) -> cb(err, boolean)
     * hasElementByName(value, cb) -> cb(err, boolean)
     * hasElementByLinkText(value, cb) -> cb(err, boolean)
     * hasElementByPartialLinkText(value, cb) -> cb(err, boolean)
     * hasElementByTagName(value, cb) -> cb(err, boolean)
     * hasElementByXPath(value, cb) -> cb(err, boolean)
     * hasElementByCss(value, cb) -> cb(err, boolean)
     *
     * @jsonWire POST /session/:sessionId/elements
     * @docOrder 8
     */
    prototype['hasElement' + utils.elFuncSuffix(type)] = function() {
      var args = __slice.call(arguments, 0);
      args.unshift(utils.elFuncFullType(type));
      this.hasElement.apply(this, args);
    };

    /**
     * waitForElementByClassName(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByCssSelector(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementById(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByName(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByLinkText(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByPartialLinkText(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByTagName(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByXPath(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * waitForElementByCss(value, asserter, timeout, pollFreq, cb) -> cb(err)
     * asserter, timeout, pollFreq are optional, opts may be passed instead,
     * as in waitForElement.
     */
    prototype['waitForElement' + utils.elFuncSuffix(type)] = function() {
      var args = __slice.call(arguments, 0);
      args.unshift(utils.elFuncFullType(type));
      this._waitForElement.apply(this, args);
    };

    /**
     * waitForVisibleByClassName(value, timeout, cb) -> cb(err)
     * waitForVisibleByCssSelector(value, timeout, cb) -> cb(err)
     * waitForVisibleById(value, timeout, cb) -> cb(err)
     * waitForVisibleByName(value, timeout, cb) -> cb(err)
     * waitForVisibleByLinkText(value, timeout, cb) -> cb(err)
     * waitForVisibleByPartialLinkText(value, timeout, cb) -> cb(err)
     * waitForVisibleByTagName(value, timeout, cb) -> cb(err)
     * waitForVisibleByXPath(value, timeout, cb) -> cb(err)
     * waitForVisibleByCss(value, timeout, cb) -> cb(err)
     */
    prototype['waitForVisible' + utils.elFuncSuffix(type)] = function() {
      var args = __slice.call(arguments, 0);
      args.unshift(utils.elFuncFullType(type));
      this._waitForVisible.apply(this, args);
    };

    /**
     * waitForNotVisibleByClassName(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByCssSelector(value, timeout, cb) -> cb(err)
     * waitForNotVisibleById(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByName(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByLinkText(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByPartialLinkText(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByTagName(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByXPath(value, timeout, cb) -> cb(err)
     * waitForNotVisibleByCss(value, timeout, cb) -> cb(err)
     */
    prototype['waitForNotVisible' + utils.elFuncSuffix(type)] = function() {
      var args = __slice.call(arguments, 0);
      args.unshift(utils.elFuncFullType(type));
      this.waitForVisible.apply(this, args);
    };

    /**
     * elementsByClassName(value, cb) -> cb(err, elements)
     * elementsByCssSelector(value, cb) -> cb(err, elements)
     * elementsById(value, cb) -> cb(err, elements)
     * elementsByName(value, cb) -> cb(err, elements)
     * elementsByLinkText(value, cb) -> cb(err, elements)
     * elementsByPartialLinkText(value, cb) -> cb(err, elements)
     * elementsByTagName(value, cb) -> cb(err, elements)
     * elementsByXPath(value, cb) -> cb(err, elements)
     * elementsByCss(value, cb) -> cb(err, elements)
     *
     * @jsonWire POST /session/:sessionId/elements
     * @docOrder 2
     */
  }
  if(plural){
    prototype['elements' + utils.elFuncSuffix(type)] = function() {
      var args = __slice.call(arguments, 0);
      args.unshift(utils.elFuncFullType(type));
      this.elements.apply(this, args);
    };
  }
};

_.each(utils.elementFuncTypes, function(suffix) {
  webdriver.prototype._buildBySuffixMethods(suffix, webdriver.prototype, true, true);
});

/**
 * getTagName(element, cb) -> cb(err, name)
 *
 * @jsonWire GET /session/:sessionId/element/:id/name
 */
webdriver.prototype.getTagName = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/name'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * getAttribute(element, attrName, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 1
 */
webdriver.prototype.getAttribute = function(element, attrName) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/attribute/' + attrName
    , cb: this._callbackWithData(cb)
  });
};

/**
 * isDisplayed(element, cb) -> cb(err, displayed)
 *
 * @jsonWire GET /session/:sessionId/element/:id/displayed
 */
webdriver.prototype.isDisplayed = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/displayed'
    , cb: this._callbackWithData(cb)
  });
};

webdriver.prototype.displayed = webdriver.prototype.isDisplayed;

/**
  * isEnabled(element, cb) -> cb(err, enabled)
  *
  * @jsonWire GET /session/:sessionId/element/:id/enabled
  */
webdriver.prototype.isEnabled = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/enabled'
    , cb: this._callbackWithData(cb)
  });
};

webdriver.prototype.enabled = webdriver.prototype.isEnabled;

/**
 * isSelected(element, cb) -> cb(err, selected)
 *
 * @jsonWire GET /session/:sessionId/element/:id/selected
 */
webdriver.prototype.isSelected = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/selected'
    , cb: this._callbackWithData(cb)
  });
};

// webdriver.prototype.selected = webdriver.prototype.isSelected;

/**
 * Get element value (in value attribute):
 * getValue(element, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 3
 */
webdriver.prototype.getValue = function(element) {
  var cb = findCallback(arguments);
  this.getAttribute.apply(this, [element, 'value', cb]);
};

/**
 * clickElement(element, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/click
 */
webdriver.prototype.clickElement = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/click'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * getComputedCss(element, cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
webdriver.prototype.getComputedCss = function(element, cssProperty) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/css/' + cssProperty
    , cb: this._callbackWithData(cb)
  });
};

webdriver.prototype.getComputedCSS = webdriver.prototype.getComputedCss;

/**
 * equalsElement(element, other , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/equals/:other
 */
webdriver.prototype.equalsElement = function(element, other) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/equals/' + other
    , cb: this._callbackWithData(cb)
  });
};

var _flick1 = function(){
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      xspeed = fargs.all[0],
      yspeed = fargs.all[1],
      swipe = fargs.all[2];

  var data = { xspeed: xspeed, yspeed: yspeed };
  if (swipe) {
    data.swipe = swipe;
  }

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/touch/flick'
    , data: data
    , cb: this._simpleCallback(cb)
  });
};

var _flick2 = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      element = fargs.all[0],
      xoffset = fargs.all[1],
      yoffset = fargs.all[2],
      speed = fargs.all[3];

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/touch/flick'
    , data: { element: element, xoffset: xoffset, yoffset: yoffset, speed: speed }
    , cb: this._simpleCallback(cb)
  });
};

/**
 * flick(xSpeed, ySpeed, swipe, cb) -> cb(err)
 * Flicks, starting anywhere on the screen.
 *
 * flick(element, xoffset, yoffset, speed, cb) -> cb(err)
 * Flicks, starting at element center.
 *
 * @jsonWire POST /session/:sessionId/touch/flick
 */
webdriver.prototype.flick = function() {
  var args = __slice.call(arguments, 0);
  if (args.length <= 4) {
    _flick1.apply(this, args);
  } else {
    _flick2.apply(this, args);
  }
};

/**
 * tap(element) -> cb(err)
 * Taps element
 *
 * @jsonWire POST /session/:sessionId/touch/click
 */
webdriver.prototype.tapElement = function(element, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/touch/click'
    , data: { element: element.value.toString() }
    , cb: this._simpleCallback(cb)
  });
};

/**
 * moveTo(element, xoffset, yoffset, cb) -> cb(err)
 * Move to element, element may be null, xoffset and y offset
 * are optional.
 *
 * @jsonWire POST /session/:sessionId/moveto
 */
webdriver.prototype.moveTo = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      element = fargs.all[0],
      xoffset = fargs.all[1],
      yoffset = fargs.all[2];

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/moveto'
    , data: { element:
      element? element.toString(): null,
      xoffset: xoffset,
      yoffset: yoffset }
    , cb: this._simpleCallback(cb)
  });
};

/**
 * buttonDown(button ,cb) -> cb(err)
 * button is optional.
 * {LEFT = 0, MIDDLE = 1 , RIGHT = 2}.
 * LEFT if not specified.
 *
 * @jsonWire POST /session/:sessionId/buttondown
 */
webdriver.prototype.buttonDown = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      button = fargs.all[0];
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/buttondown'
    , data: {button: button}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * buttonUp(button, cb) -> cb(err)
 * button is optional.
 * {LEFT = 0, MIDDLE = 1 , RIGHT = 2}.
 * LEFT if not specified.
 *
 * @jsonWire POST /session/:sessionId/buttonup
 */
webdriver.prototype.buttonUp = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      button = fargs.all[0];
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/buttonup'
    , data: {button: button}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * click(button, cb) -> cb(err)
 * Click on current element.
 * Buttons: {left: 0, middle: 1 , right: 2}
 *
 * @jsonWire POST /session/:sessionId/click
 */
webdriver.prototype.click = function() {
  // parsing args, button optional
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      button = fargs.all[0];

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/click'
    , data: {button: button}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * doubleclick(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/doubleclick
 */
webdriver.prototype.doubleclick = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/doubleclick'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * type(element, keys, cb) -> cb(err)
 * Type keys (all keys are up at the end of command).
 * special key map: wd.SPECIAL_KEYS (see lib/special-keys.js)
 *
 * @jsonWire POST /session/:sessionId/element/:id/value
 */
webdriver.prototype.type = function(element, keys) {
  var cb = findCallback(arguments);
  if (!(keys instanceof Array)) {keys = [keys];}
  // ensure all keystrokes are strings to conform to JSONWP
  _.each(keys, function(key, idx) {
    if (typeof key !== "string") {
      keys[idx] = key.toString();
    }
  });
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/value'
    , data: {value: keys}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * submit(element, cb) -> cb(err)
 * Submit a `FORM` element.
 *
 * @jsonWire POST /session/:sessionId/element/:id/submit
 */
webdriver.prototype.submit = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/submit'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * keys(keys, cb) -> cb(err)
 * Press keys (keys may still be down at the end of command).
 * special key map: wd.SPECIAL_KEYS (see lib/special-keys.js)
 *
 * @jsonWire POST /session/:sessionId/keys
 */
webdriver.prototype.keys = function(keys) {
  var cb = findCallback(arguments);
  if (!(keys instanceof Array)) {keys = [keys];}
  // ensure all keystrokes are strings to conform to JSONWP
  _.each(keys, function(key, idx) {
    if (typeof key !== "string") {
      keys[idx] = key.toString();
    }
  });
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/keys'
    , data: {value: keys}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * clear(element, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/clear
 */
webdriver.prototype.clear = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/clear'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * title(cb) -> cb(err, title)
 *
 * @jsonWire GET /session/:sessionId/title
 */
webdriver.prototype.title = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/title'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * source(cb) -> cb(err, source)
 *
 * @jsonWire GET /session/:sessionId/source
 */
webdriver.prototype.source = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
		method: 'GET'
		, relPath: '/source'
		, cb: this._callbackWithData(cb)
	});
};

// element must be specified
webdriver.prototype._rawText = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/text'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * text(element, cb) -> cb(err, text)
 * element: specific element, 'body', or undefined
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 1
 */
webdriver.prototype.text = function() {
  var cb = findCallback(arguments);
  var fargs = utils.varargs(arguments);
  var element = fargs.all[0];
  var _this = this;
  if (!element || element === 'body') {
    _this.element.apply(this, ['tag name', 'body', function(err, bodyEl) {
      if (!err) {_this._rawText.apply(_this, [bodyEl, cb]);} else {cb(err);}
    }]);
  }else {
    _this._rawText.apply(_this, [element, cb]);
  }
};

/**
 * Check if text is present:
 * textPresent(searchText, element, cb) -> cb(err, boolean)
 * element: specific element, 'body', or undefined
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 3
 */
webdriver.prototype.textPresent = function(searchText, element) {
  var cb = findCallback(arguments);
  this.text.apply(this, [element, function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(err, text.indexOf(searchText) >= 0);
    }
  }]);
};

/**
 * alertText(cb) -> cb(err, text)
 *
 * @jsonWire GET /session/:sessionId/alert_text
 */
webdriver.prototype.alertText = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/alert_text'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * alertKeys(keys, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/alert_text
 */
webdriver.prototype.alertKeys = function(keys) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/alert_text'
    , data: {text: keys}
    , cb: this._simpleCallback(cb)
  });
};

/**
 * acceptAlert(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/accept_alert
 */
webdriver.prototype.acceptAlert = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/accept_alert'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * dismissAlert(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/dismiss_alert
 */
webdriver.prototype.dismissAlert = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/dismiss_alert'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * active(cb) -> cb(err, element)
 *
 * @jsonWire POST /session/:sessionId/element/active
 */
webdriver.prototype.active = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/active'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * url(cb) -> cb(err, url)
 *
 * @jsonWire GET /session/:sessionId/url
 */
webdriver.prototype.url = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/url'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * allCookies() -> cb(err, cookies)
 *
 * @jsonWire GET /session/:sessionId/cookie
 */
webdriver.prototype.allCookies = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/cookie'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * setCookie(cookie, cb) -> cb(err)
 * cookie example:
 *  {name:'fruit', value:'apple'}
 * Optional cookie fields:
 *  path, domain, secure, expiry
 *
 * @jsonWire POST /session/:sessionId/cookie
 */
webdriver.prototype.setCookie = function(cookie) {
  var cb = findCallback(arguments);
  // setting secure otherwise selenium server throws
  if(cookie){ cookie.secure = cookie.secure || false; }

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/cookie'
    , data: { cookie: cookie }
    , cb: this._simpleCallback(cb)
  });
};

/**
 * deleteAllCookies(cb) -> cb(err)
 *
 * @jsonWire DELETE /session/:sessionId/cookie
 */
webdriver.prototype.deleteAllCookies = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'DELETE'
    , relPath: '/cookie'
    , cb: this._simpleCallback(cb)
  });
};

/**
 * deleteCookie(name, cb) -> cb(err)
 *
 * @jsonWire DELETE /session/:sessionId/cookie/:name
 */
webdriver.prototype.deleteCookie = function(name) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'DELETE'
    , relPath: '/cookie/' + encodeURIComponent(name)
    , cb: this._simpleCallback(cb)
  });
};

/**
 * getOrientation(cb) -> cb(err, orientation)
 *
 * @jsonWire GET /session/:sessionId/orientation
 */
webdriver.prototype.getOrientation = function() {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/orientation'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * setOrientation(cb) -> cb(err, orientation)
 *
 * @jsonWire POST /session/:sessionId/orientation
 */
webdriver.prototype.setOrientation = function(orientation) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/orientation'
    , data: { orientation: orientation }
    , cb: this._callbackWithData(cb)
  });
};

/**
 * setLocalStorageKey(key, value, cb) -> cb(err)
 *
 * # uses safeExecute() due to localStorage bug in Selenium
 *
 * @jsonWire POST /session/:sessionId/local_storage
 */
webdriver.prototype.setLocalStorageKey = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      key = fargs.all[0],
      value = fargs.all[1];

  this.safeExecute("localStorage.setItem(arguments[0], arguments[1])", [key, value], cb);
};

/**
 * getLocalStorageKey(key, cb) -> cb(err)
 *
 * # uses safeEval() due to localStorage bug in Selenium
 *
 * @jsonWire GET /session/:sessionId/local_storage/key/:key
 */
webdriver.prototype.getLocalStorageKey = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      key = fargs.all[0];

  this.safeEval("localStorage.getItem('" + key + "')", cb);
};

/**
 * removeLocalStorageKey(key, cb) -> cb(err)
 *
 * # uses safeExecute() due to localStorage bug in Selenium
 *
 * @jsonWire DELETE /session/:sessionId/local_storage/key/:key
 */
webdriver.prototype.removeLocalStorageKey = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      key = fargs.all[0];

  this.safeExecute("localStorage.removeItem(arguments[0])", [key], cb);
};

/**
 * clearLocalStorage(cb) -> cb(err)
 *
 * # uses safeExecute() due to localStorage bug in Selenium
 *
 * @jsonWire DELETE /session/:sessionId/local_storage
 */
webdriver.prototype.clearLocalStorage = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback;

  this.safeExecute("localStorage.clear()", cb);
};


var _isVisible1 = function(element){
  var cb = findCallback(arguments);
  this.getComputedCSS(element, "display", function(err, display){
    if(err){
      return cb(err);
    }

    cb(null, display !== "none");
  });
};

var _isVisible2 = function(queryType, querySelector){
  var cb = findCallback(arguments);
  this.elementIfExists(queryType, querySelector, function(err, element){
    if(err){
      return cb(err);
    }

    if(element){
      element.isVisible(cb);
    } else {
      cb(null, false); }
  });
};

/**
 * isVisible(element , cb) -> cb(err, boolean)
 * isVisible(queryType, querySelector, cb) -> cb(err, boolean)
 */
webdriver.prototype.isVisible = function() {
  var args = __slice.call(arguments, 0);
  if (args.length <= 2) {
    _isVisible1.apply(this, args);
  } else {
    _isVisible2.apply(this, args);
  }
};

/**
 * Retrieves the pageIndex element (added for Appium):
 * getPageIndex(element, cb) -> cb(err, pageIndex)
 */
webdriver.prototype.getPageIndex = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/pageIndex'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * getLocation(element, cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location
 */
webdriver.prototype.getLocation = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/location'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * getLocationInView(element, cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location_in_view
 */
webdriver.prototype.getLocationInView = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/location_in_view'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * getSize(element, cb) -> cb(err, size)
 *
 * @jsonWire GET /session/:sessionId/element/:id/size
 */
webdriver.prototype.getSize = function(element) {
  var cb = findCallback(arguments);
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/size'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * Uploads a local file using undocumented
 * POST /session/:sessionId/file
 * uploadFile(filepath, cb) -> cb(err, filepath)
 */
webdriver.prototype.uploadFile = function(filepath) {
  var cb = findCallback(arguments);
  var _this = this;
  var archiver = require('archiver');

  var archive = archiver('zip');
  var dataList = [];

  archive
  .on('error', function(err) {
    cb(err);
  })
  .on('data', function(data) {
    dataList.push(data);
  })
  .on('end', function() {
    _this._jsonWireCall({
    method: 'POST'
      , relPath: '/file'
      , data: { file: Buffer.concat(dataList).toString('base64') },
      cb: _this._callbackWithData(cb)
    });
  });

  archive
  .append(
    fs.createReadStream(filepath),
    { name: path.basename(filepath) }
  );

  archive.finalize(function(err) {
    if (err) {
      cb(err);
    }
  });
};

// waitForCondition recursive implementation
webdriver.prototype._waitForConditionImpl = function(conditionExpr, limit, poll) {
  var cb = findCallback(arguments);
  var _this = this;

  // timeout check
  if (Date.now() < limit) {
    // condition check
    _this.safeEval.apply( _this , [conditionExpr, function(err, res) {
      if(err) {return cb(err);}
      if (res === true) {
        // condition ok
        cb(null, true);
      } else {
        // wait for poll and try again
        setTimeout(function() {
          _this._waitForConditionImpl.apply(_this, [conditionExpr, limit, poll, cb]);
        }, poll);
      }
    }]);
  } else {
    // try one last time
    _this.safeEval.apply( _this, [conditionExpr, function(err, res) {
      if(err) {return cb(err);}
      if (res === true) {
        cb(null, true);
      } else {
        // condition nok within timeout
        cb("waitForCondition failure for: " + conditionExpr);
      }
    }]);
  }
};

/**
 * Waits for JavaScript condition to be true (polling within wd client):
 * waitForCondition(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)
 * waitForCondition(conditionExpr, timeout, cb) -> cb(err, boolean)
 * waitForCondition(conditionExpr, cb) -> cb(err, boolean)
 * conditionExpr: condition expression, should return a boolean
 * timeout: timeout (optional, default: 1000)
 * pollFreq: pooling frequency (optional, default: 100)
 * return true if condition satisfied, error otherwise.
 */
webdriver.prototype.waitForCondition = function() {
  var _this = this;

  // parsing args
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      conditionExpr = fargs.all[0],
      timeout = fargs.all[1] || 1000,
      poll = fargs.all[2] || 100;

  // calling implementation
  var limit = Date.now() + timeout;
  _this._waitForConditionImpl.apply(this, [conditionExpr, limit, poll, cb]);
};

// script to be executed in browser
webdriver.prototype._waitForConditionInBrowserJsScript = fs.readFileSync( __dirname + "/../browser-scripts/wait-for-cond-in-browser.js", 'utf8');

/**
 * Waits for JavaScript condition to be true (async script polling within browser):
 * waitForConditionInBrowser(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)
 * waitForConditionInBrowser(conditionExpr, timeout, cb) -> cb(err, boolean)
 * waitForConditionInBrowser(conditionExpr, cb) -> cb(err, boolean)
 * conditionExpr: condition expression, should return a boolean
 * timeout: timeout (optional, default: 1000)
 * pollFreq: pooling frequency (optional, default: 100)
 * return true if condition satisfied, error otherwise.
 */
webdriver.prototype.waitForConditionInBrowser = function() {
  var _this = this;
  // parsing args
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      conditionExpr = fargs.all[0],
      timeout = fargs.all[1] || 1000,
      poll = fargs.all[2] || 100;

  // calling script
  _this.safeExecuteAsync.apply( _this, [_this._waitForConditionInBrowserJsScript,
    [conditionExpr,timeout,poll], function(err,res) {
      if(err) {return cb(err);}
      if(res !== true) {return cb("waitForConditionInBrowser failure for: " + conditionExpr);}
      cb(null, res);
    }
  ]);
};

/**
 # Updates saucelabs job:
 * sauceJobUpdate(jsonData, cb) -> cb(err)
 */
webdriver.prototype.sauceJobUpdate = function(jsonData, done) {
  var _this = this;
  if(!this.configUrl || !this.configUrl.auth){
    return done(new Error("Missing auth token."));
  } else if(!this.configUrl.auth.match(/^.+:.+$/)){
    return done(new Error("Invalid auth token."));
  }
  var httpOpts = {
    url: 'http://' + this.configUrl.auth + '@saucelabs.com/rest/v1/' +
      this.configUrl.auth.replace(/:.*$/,'') + '/jobs/' + this.sessionID,
    method: 'PUT',
    headers: {
      'Content-Type': 'text/json'
    },
    body: JSON.stringify(jsonData),
    jar: false // disable cookies: avoids CSRF issues
  };
  this._request(httpOpts, function(err) {
    if(err) { return done(err); }
    _this.emit('command', 'POST' , '/rest/v1/:user/jobs/:sessionID', jsonData);
    done();
  });
};

/**
 # Set saucelabs job status:
 * sauceJobStatus(hasPassed, cb) -> cb(err)
 */
webdriver.prototype.sauceJobStatus = function(hasPassed, done) {
  this.sauceJobUpdate({passed: hasPassed}, done);
};

/**
 # Helper sleep method:
 * sleep(ms, cb) -> cb(err)
 */
webdriver.prototype.sleep = function(ms, cb) {
  cb = cb || function() {};
  setTimeout(cb , ms);
};

webdriver.prototype.warnDeprecated = true;
