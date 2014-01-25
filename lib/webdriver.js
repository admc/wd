var EventEmitter = require('events').EventEmitter,
    _ = require("./lodash"),
    request = require('request'),
    util = require( 'util' ),
    url = require('url'),
    __slice = Array.prototype.slice,
    utils = require("./utils"),
    findCallback = utils.findCallback,
    trimToLength = utils.trimToLength,
    niceArgs = utils.niceArgs,    
    strip = utils.strip,
    config = require('./config'),
    JSONWIRE_ERRORS = require('./jsonwire-errors.js'),
    MAX_ERROR_LENGTH = 500,
    Element = require('./element'),
    commands = require('./commands');

// Webdriver client main class
// configUrl: url object constructed via url.parse
var Webdriver = module.exports = function(configUrl) {
  EventEmitter.call( this );
  this.sessionID = null;
  this.configUrl = configUrl;

  // config url without auth
  this.noAuthConfigUrl = url.parse(url.format(this.configUrl));
  delete this.noAuthConfigUrl.auth;

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

  this._httpConfig = _.clone(config.httpConfig);
};

//inherit from EventEmitter
util.inherits( Webdriver, EventEmitter );

// creates a new element
Webdriver.prototype.newElement = function(jsonWireElement) {
  return new Element(jsonWireElement, this);
};

Webdriver.prototype._buildInitUrl =function()
{
  return utils.resolveUrl( this.configUrl, 'session');
};

Webdriver.prototype._buildJsonCallUrl = function(sessionID, relPath, absPath){
  var path = ['session'];
  if(sessionID)
    { path.push('/' , sessionID); }
  if(relPath)
    { path.push(relPath); }
  if(absPath)
    { path = [absPath]; }
  path = path.join('');

  return utils.resolveUrl( this.noAuthConfigUrl, path);
};

Webdriver.prototype._getJsonwireError = function(status) {
  var jsonwireError = JSONWIRE_ERRORS.filter(function(err) {
    return err.status === status;
  });
  return ((jsonwireError.length>0) ? jsonwireError[0] : null);
};

Webdriver.prototype._newError = function(opts)
{
  var err = new Error();
  _.each(opts, function(opt, k) {
    err[k] = opt;
  });
  // nicer error output
  err.inspect = function() {
    var jsonStr = JSON.stringify(err);
    return trimToLength(jsonStr, MAX_ERROR_LENGTH);
  };
  return err;
};

Webdriver.prototype._isWebDriverException = function(res) {
  return res &&
         res.class &&
         (res.class.indexOf('WebDriverException') > 0);
};

var cbStub = function() {};

// just calls the callback when there is no result
Webdriver.prototype._simpleCallback = function(cb) {
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
Webdriver.prototype._callbackWithDataBase = function(cb) {
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
Webdriver.prototype._callbackWithData = function(cb) {
  cb = cb || cbStub;
  var _this = this;
  return _this._callbackWithDataBase(function(err,obj) {
    if(err) {return cb(err);}
    if(_this._isWebDriverException(obj.value)) {return cb(_this._newError(
      {message:obj.value.message,cause:obj.value}));}
    // we might get a WebElement back as part of executeScript, so let's
    // check to make sure we convert if necessary to element objects
    if(obj.value !== null && typeof obj.value.ELEMENT !== "undefined") {
        obj.value = _this.newElement(obj.value.ELEMENT);
    } else if (Object.prototype.toString.call(obj.value) === "[object Array]") {
        for (var i = 0; i < obj.value.length; i++) {
            if (obj.value[i] !== null && typeof obj.value[i].ELEMENT !== "undefined") {
                obj.value[i] = _this.newElement(obj.value[i].ELEMENT);
            }
        }
    }
    cb(null, obj.value);
  });
};

// retrieves ONE element
Webdriver.prototype._elementCallback = function(cb) {
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
      var el = _this.newElement(obj.value.ELEMENT);
      cb(null, el);
    }
  });
};

// retrieves SEVERAL elements
Webdriver.prototype._elementsCallback = function(cb) {
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
      var el = _this.newElement(obj.value[i].ELEMENT);
      elements.push(el);
    }
    cb(null, elements);
  });
};

Webdriver.prototype._newHttpOpts = function(method) {
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

Webdriver.prototype._request = function(httpOpts, cb, attempts) {
  var _this = this;
  request(httpOpts, function(err, res, data) {
    if(!attempts) { attempts = 1; }
    if( _this._httpConfig.retries >= 0 &&
      (_this._httpConfig.retries === 0 || (attempts -1) <= _this._httpConfig.retries) &&
      err && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
      _this.emit('http', err.code , 'Lost http connection retrying in' + _this._httpConfig.retryDelay + 'ms.', err);
      setTimeout(function() {
        _this._request(httpOpts, cb, attempts + 1 );
      }, _this._httpConfig.retryDelay);
    } else {
      if(err) {
        _this.emit('http', err.code, 'Unexpected error.' , err);
      }
      cb(err, res, data);
    }
  });
};

/**
 * attach(sessionID, cb) -> cb(err)
 * Connect to an already-active session.
 */
Webdriver.prototype.attach = function(sessionID) {
  var cb = findCallback(arguments);
  this.sessionID = sessionID;
  if(cb) { cb(null); }
};

/**
 * detach(cb) -> cb(err)
 * Detach from the current session.
 */
Webdriver.prototype.detach = function() {
  var cb = findCallback(arguments);
  this.sessionID = null;
  if(cb) { cb(null); }
};

// standard jsonwire call
Webdriver.prototype._jsonWireCall = function(opts) {
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
Webdriver.prototype._codeToString = function(code) {
  if(typeof code === 'function') {
    code = 'return (' + code + ').apply(null, arguments);';
  }
  return code;
};

_(commands).each(function(fn, name) {
  Webdriver.prototype[name] = function() {
    var _this = this;
    var fargs = utils.varargs(arguments);
    this.emit('command', "CALL" , name, niceArgs(fargs.all));
    var cb = function(err) {
      if(err) {
        err.message = '[' + name + niceArgs(fargs.all) + "] " + err.message;
        fargs.callback(err);        
      } else {
        var cbArgs = __slice.call(arguments, 0);
        _this.emit('command', "RESPONSE" , name + niceArgs(_.rest(fargs.all)), 
          niceArgs(cbArgs));
        fargs.callback.apply(null, cbArgs);
      } 
    };
    var args = _.union(fargs.all,[cb]);
    return fn.apply(this, args);
  };
});
