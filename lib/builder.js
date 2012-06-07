var http = require('http')
, __slice = Array.prototype.slice
,JSONWIRE_ERRORS = require('./jsonwire-errors.js')
,element = require('./element').element;

var strip = function strip(str) {
  var x = [];
  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i)) {
      x.push(str.charAt(i));
    }
  }
  return x.join('');
};

var getJsonwireError = function(status) {
  var jsonwireError = JSONWIRE_ERRORS.filter(function(err) {
    return err.status = status;
  });
  return ((jsonwireError.length>0) ? jsonwireError[0] : null);  
};

var newError = function(opts)
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

var isWebDriverException = function(res) {
  var _ref;
  if ((typeof res !== "undefined" && res !== null ? 
    (_ref = res["class"]) != null ? _ref.indexOf('WebDriverException') : 
      void 0 : void 0) > 0) {
    return true;
  }  
  return false;
}

// just calls the callback when there is no result
var simpleCallback = function(cb) {
  return function(res) {
    if(res==null) {
      // expected behaviour for quit
      if(cb!=null){ return cb();}
    }else{
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        if(data == '') {
          // expected behaviour 
          return cb()
        } else {
          // something wrong
          if(cb!=null){  
            return cb(new Error(
              {message:'Unexpected data in simpleCallback.', data:data}) );
          }
        }
      });
    }
  };
};

// base for all callback handling data
var callbackWithDataBase = function(cb) {
  return function(res) {
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function(chunk) { data += chunk.toString(); });
    res.on('end', function() {
      var obj;
      try {
        obj = JSON.parse(strip(data));
      } catch (e) {
        return cb(newError({message:'Not JSON response', data:data}));
      }
      if (obj.status > 0) {
        var err = newError(
          {message:'Error response status.',status:obj.status,cause:obj});          
        var jsonwireError  = getJsonwireError(obj.status);
        if(jsonwireError != null){ err['jsonwire-error'] = jsonwireError; }
        cb(err);  
      } else {
        cb(null, obj);
      }
    });
  }
};

// retrieves field value from result
var callbackWithData = function(cb) {
  return callbackWithDataBase(function(err,obj) {
    if(err != null) {return cb(err);}
    if(isWebDriverException(obj.value)) {return cb(newError(
      {message:obj.value.message,cause:obj.value}));}
    cb(null, obj.value);
  });
};

// retrieves ONE element
var elementCallback = function(cb) {
  return callbackWithDataBase(function(err, obj) {
    _this = this;
    if(err != null) {return cb(err);}
    if(isWebDriverException(obj.value)) {return cb(newError(
      {message:obj.value.message,cause:obj.value}));}
    if (!obj.value.ELEMENT) {
      cb(newError(
        {message:"no ELEMENT in response value field.",cause:obj}));
    } else {
      var el = new element(obj.value.ELEMENT, _this);
      cb(null, el);
    }
  });
};

// retrieves SEVERAL elements
var elementsCallback = function(cb) {
  return callbackWithDataBase(function(err, obj) {
    _this = this;
    if(err != null) {return cb(err);}
    if(isWebDriverException(obj.value)) {return cb(newError(
      {message:obj.value.message,cause:obj.value}));}    
    if (!(obj.value instanceof Array)) {return cb(newError(
      {message:"Response value field is not an Array.", cause:obj.value}));}
    var i, elements = [];
    for (i = 0; i < obj.value.length; i++) {
	var el = new element(obj.value[i].ELEMENT, _this);
	elements.push(el);
    }
    cb(null, elements);
  });
};

var newHttpOpts = function(method) {
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

// session initialization
var init = function(desired, cb) {
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
  var httpOpts = newHttpOpts.apply(this, ['POST']);

  // authentication (for saucelabs)
  if ((_this.username != null) && (_this.accessKey != null)) {
    var authString = _this.username + ':' + _this.accessKey;
    var buf = new Buffer(authString);
    httpOpts['headers'] = {
      'Authorization': 'Basic ' + buf.toString('base64')
    };
  }

  // building request
  var req = http.request(httpOpts, function(res) {
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
  req.write(JSON.stringify({desiredCapabilities: _desired}));

  // sending
  req.end();
};

// used to build all the methods except init
var methodBuilder = function(builderOpt) {
  // by default we call simpleCallBack(cb) assuming cb is the last argument
  var defaultCb = function() {
    var args, cb, _i;
    args = 2 <= arguments.length ? __slice.call(arguments, 0,
       _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
    return simpleCallback(cb);
  };

  return function(cb) {
    var _this = this;

    // parsing arguments
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

    // http options init
    var httpOpts = newHttpOpts.apply(this, [builderOpt.method]);

    // retrieving path information
    var relPath = builderOpt.relPath;
    if (typeof relPath === 'function') { relPath = relPath.apply(this, args) }
    var absPath = builderOpt.absPath;
    if (typeof absPath === 'function') { absPath = absPath.apply(this, args) }

    // setting path in http options
    if (this.sessionID != null) { httpOpts['path'] += '/' + this.sessionID; }
    if (relPath) { httpOpts['path'] += relPath; }
    if (absPath) { httpOpts['path'] = absPath;}

    // building callback
    cb = (builderOpt.cb || defaultCb).apply(this, args);

    // wrapping cb if we need to emit a message
    if (builderOpt.emit != null) {
      var _cb = cb;
      cb = function(res) {
        if (builderOpt.emit != null) {
          _this.emit(builderOpt.emit.event, builderOpt.emit.message);
        }
        if (_cb) { _cb(); }
      };
    }

    // logging
    _this.emit('command', httpOpts['method'],
      httpOpts['path'].replace(this.sessionID, ':sessionID')
        .replace(this.basePath, '')
      );

    // building request
    var req = http.request(httpOpts, cb);
    req.on('error', function(e) { cb(e); });

    // writting data
    var data = '';
    if (builderOpt.data != null) {
      data = builderOpt.data.apply(this, args);
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    req.write(data);

    //sending
    req.end();
  };
};

exports.simpleCallback = simpleCallback;
exports.callbackWithData = callbackWithData;
exports.elementCallback = elementCallback;
exports.elementsCallback = elementsCallback;
exports.init = init;
exports.methodBuilder = methodBuilder;

