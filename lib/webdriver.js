var EventEmitter = require('events').EventEmitter;
var async = require("async");
var fs = require("fs");
var element = require('./element').element;
var http = require("http");
var https = require("https");
var __slice = Array.prototype.slice;
var JSONWIRE_ERRORS = require('./jsonwire-errors.js');

// webdriver client main class
// remoteWdConfig is an option object containing the following fields:
// host,port, username, accessKey
var webdriver = module.exports = function(remoteWdConfig) {
  this.sessionID = null;
  this.username = remoteWdConfig.username || process.env.SAUCE_USERNAME;
  this.accessKey = remoteWdConfig.accessKey  || process.env.SAUCE_ACCESS_KEY;
  this.basePath = (remoteWdConfig.path || '/wd/hub');
  this.https = (remoteWdConfig.https || false);
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
};

//inherit from EventEmitter
webdriver.prototype = new EventEmitter();

webdriver.prototype._getJsonwireError = function(status) {
  var jsonwireError = JSONWIRE_ERRORS.filter(function(err) {
    return err.status = status;
  });
  return ((jsonwireError.length>0) ? jsonwireError[0] : null);
};

webdriver.prototype._newError = function(opts)
{
  var err = new Error();
  for (var k in opts) {
    err[k] = opts[k]
  }
  // nicer error output
  err.inspect = function() {
    var res = "";
    var browserError = null;
    for (var k in this) {
      var _this = this;
      (function() {
        var v = _this[k];
        if (typeof v === 'object') {
          if ((v["class"] != null) &&  v["class"].match(/org.openqa.selenium.remote.Response/)) {
            // for selenium classes, hidding long fields or field with
            // duplicate information
            var vAsStr = JSON.stringify(v, function(key, value) {
              if (key === 'screen' || key === 'stackTrace' || key === 'buildInformation' || key === 'localizedMessage') {
                return '[hidden]';
              } else if (key === 'message') {
                // trying to extract browser error message
                var messageMatch = value.match(/([^\n]+)\nCommand duration/);
                if((messageMatch!=null) && (messageMatch.length >= 1)) { browserError = messageMatch[1].trim(); }
                return value;
              } else {
                return value;
              }
            }, "  ");
            res += k + ": " + vAsStr + "\n";
          } else {
            // for other objects making sure output is not too long
            var vAsStr = JSON.stringify(v, undefined, "  ");
            var maxLength = 1000;
            if (vAsStr.length > maxLength) {
              vAsStr = vAsStr.substr(0, maxLength) + "\n...";
            }
            res += k + ": " + vAsStr + "\n";
          }
        } else if (typeof v != 'function')
        {
          // printing non object types without modif
          res += k + ": " + v + "\n";
        }
      })();
    };
    if(browserError != null){
      res += "browser-error: " + browserError + "\n";
    }
    return res;
  };
  return err;
};

webdriver.prototype._isWebDriverException = function(res) {
  var _ref;
  if ((typeof res !== "undefined" && res !== null ?
    (_ref = res["class"]) != null ? _ref.indexOf('WebDriverException') :
      void 0 : void 0) > 0) {
    return true;
  }
  return false;
}

// just calls the callback when there is no result
webdriver.prototype._simpleCallback = function(cb) {
  var _this = this;
  return function(res) {
    if(res==null) {
      // expected behaviour for quit
      if(cb!=null){ return cb(null);}
    }else{
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        if(data == '') {
          // expected behaviour
          return cb(null)
        } else {
          // something wrong
          if(cb!=null){
            return cb(_this._newError(
              {message:'Unexpected data in simpleCallback.', data:data}) );
          }
        }
      });
    }
  };
};

// base for all callback handling data
webdriver.prototype._callbackWithDataBase = function(cb) {
  var strip = function strip(str) {
    var x = [];
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i)) {
        x.push(str.charAt(i));
      }
    }
    return x.join('');
  };

  var _this = this;
  return function(res) {
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function(chunk) { data += chunk.toString(); });
    res.on('end', function() {
      var obj;
      try {
        obj = JSON.parse(strip(data));
      } catch (e) {
        return cb(_this._newError({message:'Not JSON response', data:data}));
      }
      if (obj.status > 0) {
        var err = _this._newError(
          {message:'Error response status.',status:obj.status,cause:obj});
        var jsonwireError  = _this._getJsonwireError(obj.status);
        if(jsonwireError != null){ err['jsonwire-error'] = jsonwireError; }
        cb(err);
      } else {
        cb(null, obj);
      }
    });
  }
};

// retrieves field value from result
webdriver.prototype._callbackWithData = function(cb) {
  var _this = this;
  return _this._callbackWithDataBase(function(err,obj) {
    if(err != null) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    cb(null, obj.value);
  });
};

// retrieves ONE element
webdriver.prototype._elementCallback = function(cb) {
  var _this = this;
  return _this._callbackWithDataBase(function(err, obj) {
    if(err != null) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    if (!obj.value.ELEMENT) {
      cb(_this._newError(
        {message:"no ELEMENT in response value field.",cause:obj}));
    } else {
      var el = new element(obj.value.ELEMENT, _this);
      cb(null, el);
    }
  });
};

// retrieves SEVERAL elements
webdriver.prototype._elementsCallback = function(cb) {
  var _this = this;
  return _this._callbackWithDataBase(function(err, obj) {
    //_this = this; TODO: not sure about this
    if(err != null) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    if (!(obj.value instanceof Array)) {return cb(_this._newError(
      {message:"Response value field is not an Array.", cause:obj.value}));}
    var i, elements = [];
    for (i = 0; i < obj.value.length; i++) {
      var el = new element(obj.value[i].ELEMENT, _this);
      elements.push(el);
    }
    cb(null, elements);
  });
};

webdriver.prototype._newHttpOpts = function(method) {
  var opts = new Object();
  opts.method = method;
  for (var o in this.options) {
    opts[o] = this.options[o];
  }
  opts.headers = {};
  opts.headers['Connection'] = 'keep-alive';
  if (opts.method === 'POST' || opts.method === 'GET')
    opts.headers['Accept'] = 'application/json';
  if (opts.method == 'POST')
    opts.headers['Content-Type'] = 'application/json; charset=UTF-8';
  return opts;
};

 
/**
 * Initialize the browser.
 *
 * @example init(desired, cb) -> cb(err, sessionID)
 * @see JsonWire POST /session
 */
webdriver.prototype.init = function(desired, cb) {
  var _this = this;

  //allow desired ovveride to be left out
  if (typeof desired == 'function') {
    cb = desired;
    desired = {};
  }

  // making copy
  var _desired = {};
  for (var k in desired) {
    _desired[k] = desired[k];
  }

  // defaulting capabilities when necessary
  for (var k in this.defaultCapabilities) {
    _desired[k] = _desired[k] || this.defaultCapabilities[k];
  }

  // http options
  var httpOpts = _this._newHttpOpts.apply(this, ['POST']);

  // authentication (for saucelabs)
  if ((_this.username != null) && (_this.accessKey != null)) {
    var authString = _this.username + ':' + _this.accessKey;
    var buf = new Buffer(authString);
    httpOpts['headers'] = {
      'Authorization': 'Basic ' + buf.toString('base64')
    };
  }

  // building request
  var data = JSON.stringify({desiredCapabilities: _desired});
  httpOpts.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
  var req = (this.https ? https : http).request(httpOpts, function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      if (res.headers.location == undefined) {
        console.log('\x1b[31mError\x1b[0m: The environment you requested was unavailable.\n');
        console.log('\x1b[33mReason\x1b[0m:\n');
        console.log(data);
        console.log('\nFor the available values please consult the WebDriver JSONWireProtocol,');
        console.log('located at: \x1b[33mhttp://code.google.com/p/selenium/wiki/JsonWireProtocol#/session\x1b[0m');
        if (cb)
          cb({ message: 'The environment you requested was unavailable.' });
        return;
      }
      var locationArr = res.headers.location.split('/');
      _this.sessionID = locationArr[locationArr.length - 1];
      _this.emit('status', '\nDriving the web on session: ' + _this.sessionID + '\n');

      if (cb) { cb(null, _this.sessionID) }
    });
  });
  req.on('error', function(e) { cb(e); });

  // writting data
  req.write(data);

  // sending
  req.end();
};

// standard jsonwire call
webdriver.prototype._jsonWireCall = function(opts) {
  var _this = this;

  // http options init
  var httpOpts = _this._newHttpOpts.apply(_this, [opts.method]);

  // retrieving path information
  var relPath = opts.relPath;
  var absPath = opts.absPath;

  // setting path in http options
  if (this.sessionID != null) { httpOpts['path'] += '/' + this.sessionID; }
  if (relPath) { httpOpts['path'] += relPath; }
  if (absPath) { httpOpts['path'] = absPath;}

  // building callback
  var cb = opts.cb
  if (opts.emit != null) {
    // wrapping cb if we need to emit a message
    var _cb = cb;
    cb = function(res) {
      if (opts.emit != null) {
        _this.emit(opts.emit.event, opts.emit.message);
      }
      if (_cb) { _cb(null); }
    };
  }

  // logging
  _this.emit('command', httpOpts['method'],
    httpOpts['path'].replace(this.sessionID, ':sessionID')
      .replace(this.basePath, '')
    );

  // writting data
  var data = '';
  if (opts.data != null) {
    data = opts.data;
  }
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  httpOpts.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
  // building request
  var req = (this.https ? https : http).request(httpOpts, cb);
  req.on('error', function(e) { cb(e); });

  req.write(data);

  //sending
  req.end();
};

/**
 * @example status(cb) -> cb(err, status)
 * @see JsonWire GET /status
 */
webdriver.prototype.status = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , absPath: this.basePath + '/status'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * @example sessions(cb) -> cb(err, sessions)
 * @see JsonWire GET /sessions
 */
webdriver.prototype.sessions = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , absPath: this.basePath + '/sessions'
    , cb: this._callbackWithData(cb)
  });
}

webdriver.prototype.chain = function(){
  var _this = this;

  //add queue if not already here
  if(!_this._queue){
    _this._queue = async.queue(function (task, callback) {
      if(task.args.length > 0 && typeof task.args[task.args.length-1] === "function"){
        //wrap the existing callback
        var func = task.args[task.args.length-1];
        task.args[task.args.length-1] = function(){
          func.apply(null, arguments);
          callback();
        }
      } else {
        //add a callback
        task.args.push(callback);
      }

      //call the function
      _this[task.name].apply(_this, task.args);
    }, 1);
  }

  var chain = {};

  //builds a placeHolder functions
  var buildPlaceholder = function(name){
    return function(){
      _this._queue.push({name: name, args: Array.prototype.slice.apply(arguments)});
      return chain;
    }
  }

  //fill the chain with placeholders
  for(var name in _this){
    if(typeof _this[name] === "function" && name !== "chain"){
      chain[name] = buildPlaceholder(name);
    }
  }

  return chain;
}

/**
 * Alternate strategy to get session capabilities
 * from server session list.
 * 
 * @example altSessionCapabilities(cb) -> cb(err, capabilities)
 * @see JsonWire GET /sessions
 */
webdriver.prototype.altSessionCapabilities = function(cb) {
  var _this = this;
  // looking for the current session
  _this.sessions.apply(this, [function(err, sessions) {
    if (err == null) {
      sessions = sessions.filter(function(session) {
        return session.id === _this.sessionID;
      });
      var _ref;
      return cb(null, (_ref = sessions[0]) != null ? _ref.capabilities : void 0);
    } else {
      return cb(err, sessions);
    }
  }]);
};

/**
 * @example sessionCapabilities(cb) -> cb(err, capabilities)
 * @see JsonWire GET /session/:sessionId
 */
webdriver.prototype.sessionCapabilities = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    // default url
    , cb: this._callbackWithData(cb)
  });
}

/**
 * @example close(cb) -> cb(err)
 * @see JsonWire DELETE /session/:sessionId/window
 */
webdriver.prototype.close = function(cb) {
  this._jsonWireCall({
    method: 'DELETE'
    , relPath: '/window'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example window(name, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/window
 */
webdriver.prototype.window = function(windowRef, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/window'
    , cb: this._simpleCallback(cb)
    , data: { name: windowRef }
  });
}

// avoid using this, webdriver seems very buggy  
// doesn't work at all with webdriver
webdriver.prototype.frame = function(frameRef, cb) {  
  if(typeof(frameRef)=='function'){
    cb = frameRef;
    frameRef = undefined;  
  }
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/frame'
    , cb: this._simpleCallback(cb)
    , data: { id: frameRef }
  });
}

/**
 * @example windowHandles(cb) -> cb(err, arrayOfHandles)
 * @see JsonWire GET /session/:sessionId/window_handles
 */
webdriver.prototype.windowHandle = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/window_handle'
    , cb: this._callbackWithData(cb)
  });
};

webdriver.prototype.windowName = function(cb) {
  this.safeEval("window.name", cb);
};

webdriver.prototype.windowHandles = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/window_handles'
    , cb: this._callbackWithData(cb)
  });
};

/**
 * Destroy the browser.
 *
 * @example quit(cb) -> cb(err)
 * @see JsonWire DELETE /session/:sessionId
 */
webdriver.prototype.quit = function(cb) {
  this._jsonWireCall({
    method: 'DELETE'
    // default url
    , emit: {event: 'status', message: '\nEnding your web drivage..\n'}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * Evaluate expression (using execute).
 *
 * @example eval(code, cb) -> cb(err, value)
 * @see JsonWire POST /session/:sessionId/execute
 */ 
webdriver.prototype.eval = function(code, cb) {
  code = "return " + code + ";"
  this.execute.apply( this, [code, function(err, res) {
    if(err!=null) {return cb(err);}
    cb(null, res);
  }]);
};

/**
 * Evaluate expression (using safeExecute).
 *
 * @example safeEval(code, cb) -> cb(err, value)
 * @see JsonWire POST /session/:sessionId/execute
 */ 
webdriver.prototype.safeEval = function(code, cb) {
  this.safeExecute.apply( this, [code, function(err, res) {
    if(err!=null) {return cb(err);}
    cb(null, res);
  }]);
};

/**
 * Execute script.
 *
 * @example execute(code, args, cb) -> cb(err, value returned)
 * @example execute(code, cb) -> cb(err, value returned)
 * @param args an optional Array of arguments
 * @see JsonWire POST /session/:sessionId/execute
 */ 
webdriver.prototype.execute = function(code,args,cb) {
  // parsing arguments (code,args,cb) with optional args
  var _args, _i;
  _args = 2 <= arguments.length ? __slice.call(arguments, 0,
    _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
  code = _args[0], args = _args[1];

  //args default
  if (typeof args === "undefined" || args === null) {
    args = [];
  }

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute'
    , cb: this._callbackWithData(cb)
    , data: {script: code, args: args}
  });
}

// script to be executed in browser
var safeExecuteJsScript = fs.readFileSync( __dirname + "/../browser-scripts/safe-execute.js", 'utf8');

/**
 * Execute script using eval(code).
 *
 * @example safeExecute(code, args, cb) -> cb(err, value returned)
 * @example safeExecute(code, cb) -> cb(err, value returned)
 * @param args an optional Array of arguments
 * @see JsonWire POST /session/:sessionId/execute
 */ 
webdriver.prototype.safeExecute = function(code,args,cb) {
  // parsing arguments (code,args,cb) with optional args
  var _args, _i;
  _args = 2 <= arguments.length ? __slice.call(arguments, 0,
    _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
  code = _args[0], args = _args[1];

  //args default
  if (typeof args === "undefined" || args === null) {
    args = [];
  }

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute'
    , cb: this._callbackWithData(cb)
    , data: {script: safeExecuteJsScript, args: [code, args]}
  });
}

/**
 * Execute async script.
 *
 * @example executeAsync(code, args, cb) -> cb(err, value returned)
 * @example executeAsync(code, cb) -> cb(err, value returned)
 * @param args an optional Array of arguments
 * @see JsonWire POST /session/:sessionId/execute_async
 */ 
webdriver.prototype.executeAsync = function(code,args,cb) {
  // parsing arguments (code,args,cb) with optional args
  var _args, _i;
  _args = 2 <= arguments.length ? __slice.call(arguments, 0,
    _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
  code = _args[0], args = _args[1];

  //args default
  if (typeof args === "undefined" || args === null) {
    args = [];
  }

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute_async'
    , cb: this._callbackWithData(cb)
    , data: {script: code, args: args}
  });
}

// script to be executed in browser
var safeExecuteAsyncJsScript = fs.readFileSync( __dirname + "/../browser-scripts/safe-execute-async.js", 'utf8');

/**
 * Execute async script using eval(code).
 *
 * @example safeExecuteAsync(code, args, cb) -> cb(err, value returned)
 * @example safeExecuteAsync(code, cb) -> cb(err, value returned)
 * @param args an optional Array of arguments
 * @see JsonWire POST /session/:sessionId/execute_async
 */ 
webdriver.prototype.safeExecuteAsync = function(code,args,cb) {
  // parsing arguments (code,args,cb) with optional args
  var _args, _i;
  _args = 2 <= arguments.length ? __slice.call(arguments, 0,
    _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
  code = _args[0], args = _args[1];

  //args default
  if (typeof args === "undefined" || args === null) {
    args = [];
  }

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/execute_async'
    , cb: this._callbackWithData(cb)
    , data: {script: safeExecuteAsyncJsScript , args: [code, args]}
  });
}

/**
 * Get a new url.
 *
 * @example get(url,cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/url
 */
webdriver.prototype.get = function(url, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/url'
    , data: {'url': url}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example refresh(cb) -> cb(err)
 * @see JsonWire POST POST /session/:sessionId/refresh
 */
webdriver.prototype.refresh = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/refresh'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example forward(cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/forward
 */
webdriver.prototype.forward = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/forward'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example back(cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/back
 */
webdriver.prototype.back = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/back'
    , cb: this._simpleCallback(cb)
  });
}


/**
 * @example setAsyncScriptTimeout(ms, cb) -> setImplicitWaitTimeout(ms, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/timeouts/implicit_wait
 */
webdriver.prototype.setImplicitWaitTimeout = function(ms, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/timeouts/implicit_wait'
    , data: {ms: ms}
    , cb: this._simpleCallback(cb)
  });
}

// for backward compatibility
webdriver.prototype.setWaitTimeout = webdriver.prototype.setImplicitWaitTimeout;

/**
 * @example setAsyncScriptTimeout(ms, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/timeouts/async_script
 */
webdriver.prototype.setAsyncScriptTimeout = function(ms, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/timeouts/async_script'
    , data: {ms: ms}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example setPageLoadTimeout(ms, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/timeouts
 */
webdriver.prototype.setPageLoadTimeout = function(ms, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/timeouts'
    , data: {type: 'page load', ms: ms}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example element(using, value, cb) -> cb(err, element)
 * @see JsonWire POST /session/:sessionId/element
 */
webdriver.prototype.element = function(using, value, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element'
    , data: {using: using, value: value}
    , cb: this._elementCallback(cb)
  });
}

/**
 * Retrieve an element avoiding not found exception and returning 
 * null instead.
 *
 * @example elementOrNull(using, value, cb) -> cb(err, element)
 * @see JsonWire /session/:sessionId/elements
 */
webdriver.prototype.elementOrNull = function(using, value, cb) {
  this.elements.apply(this, [using, value,
    function(err, elements) {
      if(err == null)
        if(elements.length>0) {cb(null,elements[0]);} else {cb(null,null);}
      else
        cb(err);
    }
  ]);
};

/**
 * Retrieve an element avoiding not found exception and returning 
 * undefined instead.
 *
 * @example elementIfExists(using, value, cb) -> cb(err, element)
 * @see JsonWire /session/:sessionId/elements
 */
webdriver.prototype.elementIfExists = function(using, value, cb) {
  this.elements.apply(this, [using, value,
    function(err, elements) {
      if(err == null)
        if(elements.length>0) {cb(null,elements[0]);} else {cb(null,undefined);}
      else
        cb(err);
    }
  ]);
};

/**
 * @example elements(using, value, cb) -> cb(err, elements)
 * @see JsonWire /session/:sessionId/elements
 */
webdriver.prototype.elements = function(using, value, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/elements'
    , data: {using: using, value: value}
    , cb: this._elementsCallback(cb)
  });
}

/**
 * Check if element exists.
 * 
 * @example hasElement(using, value, cb) -> cb(err, boolean)
 * @see JsonWire /session/:sessionId/elements
 */
webdriver.prototype.hasElement = function(using, value, cb){
  this.elements.apply( this, [using, value, function(err, elements){
    if(err==null)
      cb(null, elements.length > 0 )
    else
    cb(err);
  }]);
}
 
webdriver.prototype.waitForElement = function(using, value, timeout, cb){
  var _this = this;
  var endTime = Date.now() + timeout;

  var poll = function(){
    _this.hasElement(using, value, function(err, isHere){
      if(err){
        return cb(err);
      }

      if(isHere){
        cb(null);
      } else {
        if(Date.now() > endTime){
          cb(new Error("Element didn't appear"));
        } else {
          setTimeout(poll, 200);
        }
      }
    });
  }

  poll();
}

webdriver.prototype.waitForVisible = function(using, value, timeout, cb) {
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
  }
  poll();
}

webdriver.prototype.takeScreenshot = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/screenshot'
    , cb: this._callbackWithData(cb)
  });
}

// convert to type to something like ById, ByCssSelector, etc...
var elFuncSuffix = function(type){
  var res = (' by ' + type).replace(/(\s[a-z])/g,
    function($1){return $1.toUpperCase().replace(' ','');});
  return res.replace('Xpath', 'XPath');
};

// return correct jsonwire type
var elFuncFullType = function(type){
  if(type == 'css') {return 'css selector'} // shortcut for css
  return type;
};

// from JsonWire spec + shortcuts
var elementFuncTypes = ['class name', 'css selector','id','name','link text',
  'partial link text','tag name', 'xpath', 'css' ];

// adding all elementBy... , elementsBy... function

for (var i = 0; i < elementFuncTypes.length; i++) {

  (function() {
    var type = elementFuncTypes[i];
    /**
     * @example elementByClassName(value, cb) -> cb(err, element)
     * @example elementByCssSelector(value, cb) -> cb(err, element)
     * @example elementById(value, cb) -> cb(err, element)
     * @example elementByName(value, cb) -> cb(err, element)
     * @example elementByLinkText(value, cb) -> cb(err, element)
     * @example elementByPartialLinkText(value, cb) -> cb(err, element)
     * @example elementByTagName(value, cb) -> cb(err, element)
     * @example elementByXPath(value, cb) -> cb(err, element)
     * @example elementByCss(value, cb) -> cb(err, element)
     * @see JsonWire POST /session/:sessionId/element
     */
    webdriver.prototype['element' + elFuncSuffix(type)] = function(value, cb) {
      webdriver.prototype.element.apply(this, [elFuncFullType(type), value, cb]);
    };

    /**
     * Retrieve an element avoiding not found exception and returning 
     * null instead.
     *
     * @example elementByClassNameOrNull(value, cb) -> cb(err, element)
     * @example elementByCssSelectorOrNull(value, cb) -> cb(err, element)
     * @example elementByIdOrNull(value, cb) -> cb(err, element)
     * @example elementByNameOrNull(value, cb) -> cb(err, element)
     * @example elementByLinkTextOrNull(value, cb) -> cb(err, element)
     * @example elementByPartialLinkTextOrNull(value, cb) -> cb(err, element)
     * @example elementByTagNameOrNull(value, cb) -> cb(err, element)
     * @example elementByXPathOrNull(value, cb) -> cb(err, element)
     * @example elementByCssOrNull(value, cb) -> cb(err, element)
     * @see JsonWire /session/:sessionId/elements
     */    
    webdriver.prototype['element' + elFuncSuffix(type)+ 'OrNull'] = function(value, cb) {
      webdriver.prototype.elements.apply(this, [elFuncFullType(type), value,
        function(err, elements) {
          if(err == null)
            if(elements.length>0) {cb(null,elements[0]);} else {cb(null,null);}
          else
            cb(err);
        }
      ]);
    };

    /**
     * Retrieve an element avoiding not found exception and returning 
     * undefined instead.
     *
     * @example elementByClassNameIfExists(value, cb) -> cb(err, element)
     * @example elementByCssSelectorIfExists(value, cb) -> cb(err, element)
     * @example elementByIdIfExists(value, cb) -> cb(err, element)
     * @example elementByNameIfExists(value, cb) -> cb(err, element)
     * @example elementByLinkTextIfExists(value, cb) -> cb(err, element)
     * @example elementByPartialLinkTextIfExists(value, cb) -> cb(err, element)
     * @example elementByTagNameIfExists(value, cb) -> cb(err, element)
     * @example elementByXPathIfExists(value, cb) -> cb(err, element)
     * @example elementByCssIfExists(value, cb) -> cb(err, element)
     * @see JsonWire /session/:sessionId/elements
     */       
    webdriver.prototype['element' + elFuncSuffix(type)+ 'IfExists'] = function(value, cb) {
      webdriver.prototype.elements.apply(this, [elFuncFullType(type), value,
        function(err, elements) {
          if(err == null)
            if(elements.length>0) {cb(null,elements[0]);} else {cb(null,undefined);}
          else
            cb(err);
        }
      ]);
    };

    /**
     * Retrieve an element avoiding not found exception and returning 
     * undefined instead.
     *
     * @example hasElementByClassName(value, cb) -> cb(err, boolean) 
     * @example hasElementByCssSelector(value, cb) -> cb(err, boolean) 
     * @example hasElementById(value, cb) -> cb(err, boolean) 
     * @example hasElementByName(value, cb) -> cb(err, boolean) 
     * @example hasElementByLinkText(value, cb) -> cb(err, boolean) 
     * @example hasElementByPartialLinkText(value, cb) -> cb(err, boolean) 
     * @example hasElementByTagName(value, cb) -> cb(err, boolean) 
     * @example hasElementByXPath(value, cb) -> cb(err, boolean) 
     * @example hasElementByCss(value, cb) -> cb(err, boolean) 
     * @see JsonWire /session/:sessionId/elements
     */
    webdriver.prototype['hasElement' + elFuncSuffix(type)] = function(value, cb) {
      webdriver.prototype.hasElement.apply(this, [elFuncFullType(type), value, cb]);
    };

    webdriver.prototype['waitForElement' + elFuncSuffix(type)] = function(value, timeout, cb) {
      webdriver.prototype.waitForElement.apply(this, [elFuncFullType(type), value, timeout, cb]);
    };

    webdriver.prototype['waitForVisible' + elFuncSuffix(type)] = function(value, timeout, cb) {
      webdriver.prototype.waitForVisible.apply(this, [elFuncFullType(type), value, timeout, cb]);
    };

    /**
     * @example elementsByClassName(value, cb) -> cb(err, elements)      
     * @example elementsByCssSelector(value, cb) -> cb(err, elements)      
     * @example elementsById(value, cb) -> cb(err, elements)      
     * @example elementsByName(value, cb) -> cb(err, elements)      
     * @example elementsByLinkText(value, cb) -> cb(err, elements)      
     * @example elementsByPartialLinkText(value, cb) -> cb(err, elements)      
     * @example elementsByTagName(value, cb) -> cb(err, elements)      
     * @example elementsByXPath(value, cb) -> cb(err, elements)      
     * @example elementsByCss(value, cb) -> cb(err, elements)      
     * @see JsonWire /session/:sessionId/elements
     */       
    webdriver.prototype['elements' + elFuncSuffix(type)] = function(value, cb) {
      webdriver.prototype.elements.apply(this, [elFuncFullType(type), value, cb]);
    };

  })();

}

webdriver.prototype.getTagName = function(element, cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/name'
    , cb: this._callbackWithData(cb)
  });
}

/**
 * @example getAttribute(element, attrName, cb) -> cb(err, value)
 * @see JsonWire GET /session/:sessionId/element/:id/attribute/:name
 */
webdriver.prototype.getAttribute = function(element, attrName, cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/attribute/' + attrName
    , cb: this._callbackWithData(cb)
  });
}

/**
 * @example isDisplayed(element, cb) -> cb(err, displayed)
 * @see JsonWire POST /session/:sessionId/element/:id/displayed
 */
webdriver.prototype.isDisplayed = function(element, cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/displayed'
    , cb: this._callbackWithData(cb)
  });
}

webdriver.prototype.displayed = webdriver.prototype.isDisplayed

/**
 * Get element value (in value attribute).
 * 
 * @example getValue(element, cb) -> cb(err, value)
 * @see JsonWire GET /session/:sessionId/element/:id/attribute/:name
 */
webdriver.prototype.getValue = function(element, cb) {
  this.getAttribute.apply(this, [element, 'value', cb]);
};

/**
 * @example clickElement(element, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/element/:id/click
 */
webdriver.prototype.clickElement = function(element, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/click'
    , cb: this._simpleCallback(cb)
  });
}

webdriver.prototype.getComputedCss = function(element, styleName, cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/css/' + styleName
    , cb: this._callbackWithData(cb)
  });
}

webdriver.prototype.getComputedCSS = webdriver.prototype.getComputedCss

/**
 * Move to element, xoffset and y offset are optional.
 * 
 * @example moveTo(element, xoffset, yoffset, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/moveto
 */
webdriver.prototype.moveTo = function(element, xoffset, yoffset, cb) {
  // parsing arguments, xoffset and y offset are optional
  var args, _i;
  element = arguments[0], args = 3 <= arguments.length ?
    __slice.call(arguments, 1, _i = arguments.length - 1) :
      (_i = 1, []), cb = arguments[_i++];
  xoffset = args[0], yoffset = args[1], args;

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/moveto'
    , data: { element: element.toString(), xoffset: xoffset, yoffset: yoffset }
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example buttonDown(cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/buttondown
 */
webdriver.prototype.buttonDown = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/buttondown'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example buttonUp(cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/buttonup
 */
webdriver.prototype.buttonUp = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/buttonup'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * Click on current element.
 * Buttons: {left: 0, middle: 1 , right: 2}
 * 
 * @example click(button, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/click
 */
webdriver.prototype.click = function(button, cb) {
  // parsing args, button optional
  var args, _i;
  args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
  button = args[0], args;

  this._jsonWireCall({
    method: 'POST'
    , relPath: '/click'
    , data: {button: button}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example doubleclick(cb) -> cb(err) 
 * @see JsonWire POST /session/:sessionId/doubleclick
 */
webdriver.prototype.doubleclick = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/doubleclick'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * Type keys (all keys are up at the end of command).
 *
 * @example type(element, keys, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/element/:id/value
 */
webdriver.prototype.type = function(element, keys, cb) {
  if (!(keys instanceof Array)) {keys = [keys];}
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/value'
    , data: {value: keys}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * Press keys (keys may still be down at the end of command).
 *
 * @example keys(keys, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/keys
 */
webdriver.prototype.keys = function(keys, cb) {
  if (!(keys instanceof Array)) {keys = [keys];}
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/keys'
    , data: {value: keys}
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example clear(element, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/element/:id/clear
 */
webdriver.prototype.clear = function(element, cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/' + element + '/clear'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example title(cb) -> cb(err, title)
 * @see JsonWire GET /session/:sessionId/title
 */
webdriver.prototype.title = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/title'
    , cb: this._callbackWithData(cb)
  });
}

// element must be specified
webdriver.prototype._rawText = function(element, cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/element/' + element + '/text'
    , cb: this._callbackWithData(cb)
  });
}

/**
 * @example text(element, cb) -> (err, text)
 * @param element specific element, 'body', or undefined 
 * @see JsonWire GET /session/:sessionId/element/:id/text
 */
webdriver.prototype.text = function(element, cb) {
  var _this = this;
  if (typeof element === 'undefined' || element == 'body' || element === null) {
    _this.element.apply(this, ['tag name', 'body', function(err, bodyEl) {
      if (err == null) {_this._rawText.apply(_this, [bodyEl, cb]);} else {cb(err);}
    }]);
  }else {
    _this._rawText.apply(_this, [element, cb]);
  }
};
/**
 * Check if text is present. 
 *
 * @example textPresent(searchText, element, cb) -> (err, boolean)
 * @param element specific element, 'body', or undefined 
 * @see JsonWire GET /session/:sessionId/element/:id/text
 */
webdriver.prototype.textPresent = function(searchText, element, cb) {
  this.text.apply(this, [element, function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(err, text.indexOf(searchText) >= 0);
    }
  }]);
};

/**
 * @example acceptAlert(cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/accept_alert
 */
webdriver.prototype.acceptAlert = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/accept_alert'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example dismissAlert(cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/dismiss_alert
 */
webdriver.prototype.dismissAlert = function(cb) {
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/dismiss_alert'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example active(cb) -> cb(err, element)
 * @see JsonWire POST /session/:sessionId/element/active
 */
webdriver.prototype.active = function(cb) {
  var _this = this;
  var cbWrap = function(e, o) {
    var el = new element(o['ELEMENT'], _this);
    cb(null, el)
  };
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/element/active'
    , cb: this._callbackWithData(cbWrap)
  });
}

/**
 * @example url(cb) -> cb(err, url)
 * @see JsonWire GET /session/:sessionId/url
 */
webdriver.prototype.url = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/url'
    , cb: this._callbackWithData(cb)
  });
}

/**
 * @example allCookies() -> cb(err, cookies)
 * @see JsonWire GET /session/:sessionId/cookie
 */
webdriver.prototype.allCookies = function(cb) {
  this._jsonWireCall({
    method: 'GET'
    , relPath: '/cookie'
    , cb: this._callbackWithData(cb)
  });
}

/**
 * Set cookie.
 *
 * Cookie example:   
 *  {name:'fruit', value:'apple'}
 * Optional cookie fields: 
 *  path, domain, secure, expiry
 *
 * @example setCookie(cookie, cb) -> cb(err)
 * @see JsonWire POST /session/:sessionId/cookie
 */
webdriver.prototype.setCookie = function(cookie, cb) {
  // setting secure otherwise selenium server throws
  if ((typeof cookie !== 'undefined' && cookie !== null) &&
    !((typeof cookie !== 'undefined' &&
    cookie !== null ? cookie.secure : void 0) != null)) {
    cookie.secure = false;
  }
  this._jsonWireCall({
    method: 'POST'
    , relPath: '/cookie'
    , data: { cookie: cookie }
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example deleteAllCookies(cb) -> cb(err)
 * @see JsonWire DELETE /session/:sessionId/cookie
 */
webdriver.prototype.deleteAllCookies = function(cb) {
  this._jsonWireCall({
    method: 'DELETE'
    , relPath: '/cookie'
    , cb: this._simpleCallback(cb)
  });
}

/**
 * @example deleteCookie(name, cb) -> cb(err)
 * @see JsonWire DELETE /session/:sessionId/cookie/:name
 */
webdriver.prototype.deleteCookie = function(name, cb) {
  this._jsonWireCall({
    method: 'DELETE'
    , relPath: '/cookie/' + encodeURIComponent(name)
    , cb: this._simpleCallback(cb)
  });
}

var _isVisible1 = function(element , cb){
  this.getComputedCSS(element, "display", function(err, display){
    if(err){
      return cb(err);
    }

    cb(null, display !== "none");
  });
}

// deprecated 
var _isVisible2 = function(queryType, querySelector, cb){
  this.elementIfExists(queryType, querySelector, function(err, element){
    if(err){
      return cb(err);
    }

    if(element == null){
      return cb(null, false);
    }
    element.isVisible(cb);
  });
}

// arguments like the following:
// (element , cb)
// (queryType, querySelector, cb) deprecated
webdriver.prototype.isVisible = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if (args.length <= 2) {
    return _isVisible1.apply(this, args);
  } else {
    return _isVisible2.apply(this, args);
  }
};

// waitForCondition recursive implementation
webdriver.prototype._waitForConditionImpl = function(conditionExpr, limit, poll, cb) {
  var _this = this;

  // timeout check
  if (Date.now() < limit) {
    // condition check
    _this.safeEval.apply( _this , [conditionExpr, function(err, res) {
      if(err != null) {return cb(err);}
      if (res == true) {
        // condition ok
        return cb(null, true);
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
      if(err != null) {return cb(err);}
      if (res == true) {
        return cb(null, true);
      } else {
        // condition nok within timeout
        return cb("waitForCondition failure for: " + conditionExpr);
      }
    }]);
  }
};

/**
 * Waits for JavaScript condition to be true (polling within wd client).
 *
 * @example waitForCondition(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)
 * @example waitForCondition(conditionExpr, timeout, cb) -> cb(err, boolean)
 * @example waitForCondition(conditionExpr, cb) -> cb(err, boolean)
 * @param conditionExpr condition expression, should return a boolean
 * @param timeout timeout (optional, default: 1000) 
 * @param pollFreq pooling frequency (optional, default: 100)
 * @return true if condition satisfied, error otherwise. 
 */
webdriver.prototype.waitForCondition = function() {
  var _this = this;

  // parsing args
  var args, cb, conditionExpr, limit, poll, timeout, _i;
  args = 2 <= arguments.length ? __slice.call(arguments, 0,
    _i = arguments.length - 1) : (_i = 0, []),
      cb = arguments[_i++];
  conditionExpr = args[0], timeout = args[1], poll = args[2];

  //defaults
  timeout = timeout || 1000;
  poll = poll || 100;

  // calling implementation
  limit = Date.now() + timeout;
  _this._waitForConditionImpl.apply(this, [conditionExpr, limit, poll, cb]);
};

// script to be executed in browser
webdriver.prototype._waitForConditionInBrowserJsScript = fs.readFileSync( __dirname + "/../browser-scripts/wait-for-cond-in-browser.js", 'utf8');

/**
 * Waits for JavaScript condition to be true 
 * (async script polling within browser).
 *
 * @example waitForConditionInBrowser(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)
 * @example waitForConditionInBrowser(conditionExpr, timeout, cb) -> cb(err, boolean)
 * @example waitForConditionInBrowser(conditionExpr, cb) -> cb(err, boolean)
 * @param conditionExpr condition expression, should return a boolean
 * @param timeout timeout (optional, default: 1000) 
 * @param pollFreq pooling frequency (optional, default: 100)
 * @return true if condition satisfied, error otherwise. 
 */
webdriver.prototype.waitForConditionInBrowser = function() {
  var _this = this;
  // parsing args
  var args, cb, conditionExpr, limit, poll, timeout, _i;
  args = 2 <= arguments.length ? __slice.call(arguments, 0,
    _i = arguments.length - 1) : (_i = 0, []),
      cb = arguments[_i++];
  conditionExpr = args[0], timeout = args[1], poll = args[2];

  //defaults
  timeout = timeout || 1000;
  poll = poll || 100;

  // calling script
  _this.safeExecuteAsync.apply( _this, [_this._waitForConditionInBrowserJsScript,
    [conditionExpr,timeout,poll], function(err,res) {
      if(err != null) {return cb(err);}
      if(res != true) {return cb("waitForConditionInBrowser failure for: " + conditionExpr);}
      cb(null, res);
    }
  ]);
};

