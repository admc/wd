var EventEmitter = require('events').EventEmitter;
var async = require("async");
var fs = require("fs");
var element = require('./element').element;
var http = require("http");
var __slice = Array.prototype.slice;
var JSONWIRE_ERRORS = require('./jsonwire-errors.js');

// webdriver client main class
// remoteWdConfig is an option object containing the following fields:
// host,port, username, accessKey
var webdriver = module.exports = function(remoteWdConfig) {
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

// session initialization
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
var methodBuilder = webdriver.prototype._methodBuilder = function(builderOpt) {
  return function(cb) {
    var _this = this;

    // by default we call simpleCallBack(cb) assuming cb is the last argument
    var defaultCb = function() {
      var args, cb, _i;
      args = 2 <= arguments.length ? __slice.call(arguments, 0,
         _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
      return _this._simpleCallback(cb);
    };

    // parsing arguments
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

    // http options init
    var httpOpts = _this._newHttpOpts.apply(_this, [builderOpt.method]);

    // retrieving path information
    var relPath = builderOpt.relPath;
    if (typeof relPath === 'function') { relPath = relPath.apply(_this, args) }
    var absPath = builderOpt.absPath;
    if (typeof absPath === 'function') { absPath = absPath.apply(_this, args) }

    // setting path in http options
    if (this.sessionID != null) { httpOpts['path'] += '/' + this.sessionID; }
    if (relPath) { httpOpts['path'] += relPath; }
    if (absPath) { httpOpts['path'] = absPath;}

    // building callback
    cb = (builderOpt.cb || defaultCb).apply(_this, args);

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
      data = builderOpt.data.apply(_this, args);
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    req.write(data);

    //sending
    req.end();
  };
};

webdriver.prototype.status = methodBuilder({
  method: 'GET'
  , absPath: function() { return this.basePath + '/status' }
  , cb: function(cb) { return this._callbackWithData(cb); }
});

webdriver.prototype.sessions = methodBuilder({
  method: 'GET'
  , absPath: function() { return this.basePath + '/sessions' }
  , cb: function(cb) { return this._callbackWithData(cb); }
});

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

// alternate strategy to get session capabilities
// extract session capabilities from session list
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

webdriver.prototype.sessionCapabilities = methodBuilder({
  method: 'GET'
  // default url
  , cb: function(cb) { return this._callbackWithData(cb); }
});

webdriver.prototype.close = methodBuilder({
  method: 'DELETE'
  , relPath: '/window'
});

webdriver.prototype.quit = methodBuilder({
  method: 'DELETE'
  // default url
  , emit: {event: 'status', message: '\nEnding your web drivage..\n'}
});

webdriver.prototype.eval = function(code, cb) {
  code = "return " + code + ";"
  this.execute.apply( this, [code, function(err, res) {    
    if(err!=null) {return cb(err);}
    cb(null, res);
  }]);
};

webdriver.prototype.safeEval = function(code, cb) {
  this.safeExecute.apply( this, [code, function(err, res) {    
    if(err!=null) {return cb(err);}
    cb(null, res);
  }]);
};

webdriver.prototype.execute = methodBuilder({
  method: 'POST'
  , relPath: '/execute'
  , cb: function() {
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];     
    
    return this._callbackWithData(cb); 
  }
  , data: function() {
    // parsing arguments (code,args,cb) with optional args
    var args, cb, code, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
    code = _args[0], args = _args[1];
    
    //args default     
    if (typeof args === "undefined" || args === null) {
      args = [];
    }

    return {script: code, args: args}; 
  }
});

// script to be executed in browser
var safeExecuteJsScript = fs.readFileSync( __dirname + "/browser-scripts/safe-execute.js", 'utf8');

webdriver.prototype.safeExecute = methodBuilder({
  method: 'POST'
  , relPath: '/execute'
  , cb: function() {
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];         
    return this._callbackWithData(cb); 
  }
  , data: function() {
    // parsing arguments (code,args,cb) with optional args
    var args, cb, code, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
    code = _args[0], args = _args[1];
    
    //args default     
    if (typeof args === "undefined" || args === null) {
      args = [];
    }

    return {script: safeExecuteJsScript, args: [code, args]}; 
  }
});

webdriver.prototype.executeAsync = methodBuilder({
  method: 'POST'
  , relPath: '/execute_async'
  , cb: function() { 
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];     
  
    return this._callbackWithData(cb); 
  }
  , data: function(code) { 
    // parsing arguments (code,args,cb) with optional args
    var args, cb, code, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
    code = _args[0], args = _args[1];
    
    //args default     
    if (typeof args === "undefined" || args === null) {
      args = [];
    }
  
    return {script: code, args: args}; 
  }
});

// script to be executed in browser
var safeExecuteAsyncJsScript = fs.readFileSync( __dirname + "/browser-scripts/safe-execute-async.js", 'utf8');

webdriver.prototype.safeExecuteAsync = methodBuilder({
  method: 'POST'
  , relPath: '/execute_async'
  , cb: function() { 
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];     
  
    return this._callbackWithData(cb); 
  }
  , data: function(code) { 
    // parsing arguments (code,args,cb) with optional args
    var args, cb, code, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
    code = _args[0], args = _args[1];
    
    //args default     
    if (typeof args === "undefined" || args === null) {
      args = [];
    }
  
    return {script: safeExecuteAsyncJsScript , args: [code, args]}; 
  }
});

webdriver.prototype.get = methodBuilder({
  method: 'POST'
  , relPath: '/url'
  , data: function(url) { return {'url': url}; }
});

webdriver.prototype.refresh = methodBuilder({
  method: 'POST'
  , relPath: '/refresh'
});

webdriver.prototype.forward = methodBuilder({
  method: 'POST'
  , relPath: '/forward'
});

webdriver.prototype.back = methodBuilder({
  method: 'POST'
  , relPath: '/back'
});

webdriver.prototype.setImplicitWaitTimeout = methodBuilder({
  method: 'POST'
  , relPath: '/timeouts/implicit_wait'
  , data: function(ms) { return {ms: ms}; }
});

// for backward compatibility
webdriver.prototype.setWaitTimeout = webdriver.prototype.setImplicitWaitTimeout;

webdriver.prototype.setAsyncScriptTimeout = methodBuilder({
  method: 'POST'
  , relPath: '/timeouts/async_script'
  , data: function(ms) { return {ms: ms}; }
});

webdriver.prototype.setPageLoadTimeout = methodBuilder({
  method: 'POST'
  , relPath: '/timeouts/timeouts'
  , data: function(ms) { return {type: 'page load', ms: ms}; }
});

webdriver.prototype.element = methodBuilder({
  method: 'POST'
  , relPath: '/element'
  , cb: function(using, value, cb) { return this._elementCallback(cb); }
  , data: function(using, value) { return {using: using, value: value}; }
});

// avoid not found exception and return null instead
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

// avoid not found exception and return undefined instead
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

webdriver.prototype.elements = methodBuilder({
  method: 'POST'
  , relPath: '/elements'
  , cb: function(using, value, cb) { return this._elementsCallback(cb); }
  , data: function(using, value) { return {using: using, value: value}; }
});

webdriver.prototype.hasElement = function(using, value, cb){
  this.elements.apply( this, [using, value, function(err, elements){
    if(err==null)
      cb(null, elements.length > 0 )
    else
    cb(err);
  }]);
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

    webdriver.prototype['element' + elFuncSuffix(type)] = function(value, cb) {
      webdriver.prototype.element.apply(this, [elFuncFullType(type), value, cb]);
    };
    
    // avoid not found exception and return null instead
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

    // avoid not found exception and return undefined instead
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

    webdriver.prototype['hasElement' + elFuncSuffix(type)] = function(value, cb) {
      webdriver.prototype.hasElement.apply(this, [elFuncFullType(type), value, cb]);
    };

    webdriver.prototype['elements' + elFuncSuffix(type)] = function(value, cb) {
      webdriver.prototype.elements.apply(this, [elFuncFullType(type), value, cb]);
    };
  
  })();
  
}

webdriver.prototype.getAttribute = methodBuilder({
  method: 'GET'
  , relPath: function(element, attrName) {
    return '/element/' + element + '/attribute/' + attrName; }
  , cb: function(element, attrName, cb) { return this._callbackWithData(cb); }
});

webdriver.prototype.getValue = function(element, cb) {
  this.getAttribute.apply(this, [element, 'value', cb]);
};

webdriver.prototype.clickElement = methodBuilder({
  method: 'POST'
  , relPath: function(element, attrName) {
    return '/element/' + element + '/click'; }
});

webdriver.prototype.getComputedCSS = methodBuilder({
  method: 'GET'
  , relPath: function(element, styleName) {
    return '/element/' + element + '/css/' + styleName; }
  , cb: function(element, styleName, cb) { return this._callbackWithData(cb); }
});

webdriver.prototype.moveTo = methodBuilder({
  method: 'POST'
  , relPath: '/moveto'
  , data: function(element, xoffset, yoffset) {
      return { element: element.toString(), xoffset: xoffset, yoffset: yoffset }; }
});

//@todo simulate the scroll event using dispatchEvent and browser.execute
/* it's not implemented so taking it out
webdriver.prototype.scroll = methodBuilder({
  method: 'POST'
  , relPath:'/moveto'
  , data: function(element, xoffset, yoffset) {
    return { element : element, xoffset : xoffset, yoffset : yoffset }; }
});
*/

webdriver.prototype.buttonDown = methodBuilder({
  method: 'POST'
  , relPath: '/buttondown'
});

webdriver.prototype.buttonUp = methodBuilder({
  method: 'POST'
  , relPath: '/buttonup'
});

//{LEFT = 0, MIDDLE = 1 , RIGHT = 2}
webdriver.prototype.click = methodBuilder({
  method: 'POST'
  , relPath: '/click'
  , data: function(button) { return {button: button}; }
});


webdriver.prototype.doubleclick = methodBuilder({
  method: 'POST'
  , relPath: '/doubleclick'
});

//All keys are up at end of command
webdriver.prototype.type = methodBuilder({
  method: 'POST'
  , relPath: function(element, keys) {
    return '/element/' + element + '/value'; }
  , data: function(element, keys) {
    if (!(keys instanceof Array)) {keys = [keys];}
    return {value: keys};
  }
});

webdriver.prototype.keys = methodBuilder({
  method: 'POST'
  , relPath: '/keys'
  , data: function(keys) {
    if (!(keys instanceof Array)) {keys = [keys];}
    return {value: keys};
  }
});

webdriver.prototype.clear = methodBuilder({
  method: 'POST'
  , relPath: function(element) { return '/element/' + element + '/clear'; }
});

webdriver.prototype.title = methodBuilder({
  method: 'GET'
  , relPath: '/title'
  , cb: function(cb) { return this._callbackWithData(cb); }
});

// element must be specified
webdriver.prototype._rawText = methodBuilder({
  method: 'GET'
  , relPath: function(element) { return '/element/' + element + '/text'; }
  , cb: function(element, cb) { return this._callbackWithData(cb); }
});

// element is specific element, 'body', or undefined
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

// element is specific element, 'body', or undefined
webdriver.prototype.textPresent = function(searchText, element, cb) {
  this.text.apply(this, [element, function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(err, text.indexOf(searchText) >= 0);
    }
  }]);
};

webdriver.prototype.acceptAlert = methodBuilder({
  method: 'POST'
  , relPath: '/accept_alert'
});

webdriver.prototype.dismissAlert = methodBuilder({
  method: 'POST'
  , relPath: '/dismiss_alert'
});

webdriver.prototype.active = methodBuilder({
  method: 'POST'
  , relPath: '/element/active'
  , cb: function(cb) {
    var _this = this;

    return this._callbackWithData(function(e, o) {
      var el = new element(o['ELEMENT'], _this);
      cb(null, el)});
    }
});

webdriver.prototype.url = methodBuilder({
  method: 'GET'
  , relPath: '/url'
  , cb: function(cb) { return this._callbackWithData(cb); }
});


webdriver.prototype.allCookies = methodBuilder({
  method: 'GET'
  , relPath: '/cookie'
  , cb: function(cb) { return this._callbackWithData(cb); }
});

/*
cookie like the following:
  {name:'fruit', value:'apple'}
optional fields: path, domain, secure, expiry
check the JsonWire doc for details
*/
webdriver.prototype.setCookie = methodBuilder({
  method: 'POST'
  , relPath: '/cookie'
  , data: function(cookie) {
    // setting secure otherwise selenium server throws
    if ((typeof cookie !== 'undefined' && cookie !== null) &&
      !((typeof cookie !== 'undefined' &&
      cookie !== null ? cookie.secure : void 0) != null)) {
      cookie.secure = false;
    }
    return { cookie: cookie };
  }
});

webdriver.prototype.deleteAllCookies = methodBuilder({
  method: 'DELETE'
  , relPath: '/cookie'
});

webdriver.prototype.deleteCookie = methodBuilder({
  method: 'DELETE'
  , relPath: function(name) {
    return '/cookie/' + encodeURIComponent(name); }
});

webdriver.prototype.isVisible = function(queryType, querySelector, callback){
  this.elementIfExists(queryType, querySelector, function(err, element){
    if(err){
      return callback(err);
    }

    if(element == null){
      return callback(null, false);
    }

    element.getComputedCSS("display", function(err, display){
      if(err){
        return callback(err);
      }

      callback(null, display !== "none");
    });
  });
}

webdriver.prototype.waitForElement = function(queryType, querySelector, timeout, callback){
  var _this = this;
  var endTime = Date.now() + timeout;

  var poll = function(){
    _this.hasElement(queryType, querySelector, function(err, isHere){
      if(err){
        return callback(err);
      }

      if(isHere){
        callback();
      } else {
        if(Date.now() > endTime){
          callback(new Error("Element didn't appear"));
        } else {
          setTimeout(poll, 200);
        }
      }
    });
  }

  poll();
}

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

// args: (conditionExpr, timeout, poll, cb)
// timeout and poll are optional
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
webdriver.prototype._waitForConditionInBrowserJsScript = fs.readFileSync( __dirname + "/browser-scripts/wait-for-cond-in-browser.js", 'utf8');

// args: (conditionExpr, timeout, poll, cb)
// timeout and poll are optional
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
