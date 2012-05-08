var http = require("http")
  , EventEmitter = require('events').EventEmitter;

var __slice = Array.prototype.slice;

var strip = function strip(str) {
  var x = [];
  for(var i = 0; i<str.length; i++) {
    if (str.charCodeAt(i)) {
      x.push(str.charAt(i));
    }
  }
  return x.join('');
};
    
// webdriver client main class
// remoteWdConfig is an option object containing the following fields:
// host,port, username, accessKey
var webdriver = function(remoteWdConfig) {
  this.sessionID = null;
  this.username = remoteWdConfig.username;
  this.accessKey = remoteWdConfig.accessKey;
  this.basePath = (remoteWdConfig.path || '/wd/hub')
  // default 
  this.options = {
    host: remoteWdConfig.host || '127.0.0.1'
    , port: remoteWdConfig.port || 4444
    , path: (this.basePath + '/session').replace('//','/')
  };  
  this.defaultCapabilities = {
    browserName: "firefox"
    , version: ""
    , javascriptEnabled: true
    , platform: "ANY",
  }
  
  // saucelabs default
  if ((this.username != null) && (this.accessKey != null)) {
    this.defaultCapabilities.platform = "VISTA";
  }

  this._applyHttpOpts = function(opt, over) {
    opt.method = over.method || 'POST';
    opt.headers = opt.headers || {}
    opt.headers['Connection'] = 'keep-alive';    
    if (opt.method === 'POST' || opt.method === 'GET')
      opt.headers['Accept'] = 'application/json';         
    if( opt.method == 'POST' )
      opt.headers['Content-Type'] = 'application/json';    
    return opt;
  }
    
  // for init method only
  this._getInitOpts = function() {
    var opt = new Object();
    for (var o in this.options) {
      opt[o] = this.options[o];
    }
    if ((this.username != null) && (this.accessKey != null)) {
      var authString = this.username + ":" + this.accessKey;
      var buf = new Buffer(authString);
      opt['headers'] = {
        'Authorization': 'Basic '+ buf.toString('base64')
      }
    }  
    this._applyHttpOpts(opt, {})
    return opt;
  }

  // for all methods except init
  this._getOpts = function(over) {
    var opt = new Object();
    for (var o in this.options) {
      opt[o] = this.options[o];
    }
    if(this.sessionID != null)
      opt['path'] += '/'+this.sessionID;
    if (over.url) {
      opt['path'] += over.url;
    }
    this._applyHttpOpts(opt, over);
    this.emit('command', opt['method'], over.url || '--');
    return opt;
  }
  
  EventEmitter.call(this);
};

webdriver.prototype.__proto__ = EventEmitter.prototype;

// just calls the callback when there is no result
var simpleCallback = function(cb){
  return function(res) {
    if (cb){ cb(); }
  };
}

// retrieves field value from result
var callbackWithData = function(cb, objKey) {
  return function(res) {
    res.setEncoding('utf8');

    var data = "";
    res.on('data', function(chunk) { data += chunk.toString(); });
    res.on('end', function() {
      try {
        var obj = JSON.parse(strip(data));
      } catch (e) {
        return cb ('Not JSON response', data)
      }
      if (obj.status > 0) {
        cb(obj, null);
      } else {
        cb(null, objKey ? obj[objKey] : obj);
      }
    });
  }
}

// retrieves ONE element
var elementCallback = function(cb){
  return function(res) {
      res.setEncoding('utf8');

      var data = "";
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        try {
          var obj = JSON.parse(strip(data));
        } catch (e) {
          return cb ('Not JSON response', data)
        }
        if (obj.status > 0) {
          cb(obj, null);
        } else if (!obj.value.ELEMENT) {
          cb(obj, null);
        } else {
          cb(null, obj.value.ELEMENT);
        }
      });
  };
}

// retrieves SEVERAL elements
var elementsCallback = function(cb){
  return function(res) {
    var i, elements=[];
    res.setEncoding('utf8');

    var data = "";
    res.on('data', function(chunk) { data += chunk.toString(); });
    res.on('end', function() {
      try{
        var obj = JSON.parse(strip(data));
      } catch (e) {
        return cb ('Not JSON response', data)
      }
      if (obj.status > 0) {
        cb(obj, null);
      } else {
        for (i = 0; i < obj.value.length; i++) {
            elements.push(obj.value[i].ELEMENT);
        }
        cb(null, elements);
      }
    });
  };
}

 
webdriver.prototype.init = function(desired, cb) {
  var _this = this;
    
  //allow desired ovveride to be left out
  if (typeof desired == "function") {
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
   
  var req = http.request(_this._getInitOpts(), function(res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      if (res.headers.location == undefined) {
        console.log("\x1b[31mError\x1b[0m: The environment you requested was unavailable.\n");
        console.log("\x1b[33mReason\x1b[0m:\n");
        console.log(data);
        console.log("\nFor the available values please consult the WebDriver JSONWireProtocol,");
        console.log("located at: \x1b[33mhttp://code.google.com/p/selenium/wiki/JsonWireProtocol#/session\x1b[0m");
        if (cb)
          cb({ message: "The environment you requested was unavailable." });
        return;
      }
      var locationArr = res.headers.location.split("/");
      _this.sessionID = locationArr[locationArr.length - 1];
      _this.emit('status', "\nDriving the web on session: "+ _this.sessionID+"\n");

      if (cb) { cb(null, _this.sessionID) }
    });
  });
  req.on('error', function(e) { cb(e); });
  req.write(JSON.stringify({desiredCapabilities: _desired}));
  req.end();
};

var methodBuilder = function(builderOpt) {
  defaultCb = function(cb) { return simpleCallBack(cb); };
  
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
    
    // building option overide
    var over = {method:builderOpt.method};
    if (builderOpt.url != null) {      
      if (typeof builderOpt.url === 'function') {
        // for dynamically generated url
        over.url = builderOpt.url.apply( this, args);
      } else { over.url = builderOpt.url;}
    }
    
    // building callback
    cb = (builderOpt.cb || defaultCb).apply( this, args);
    
    // wrapping cb if we need to emit a message  
    if (builderOpt.emit != null){
      var _cb = cb;
      cb = function(res) {
        if (builderOpt.emit != null){
          _this.emit(builderOpt.emit.event, builderOpt.emit.message );
        }
        if (_cb){ _cb(); }
      };      
    }
    
    // preparing http request
    var httpOpts = _this._getOpts(over);
    if (builderOpt.absUrl != null){
      // for commands without session id url param
      if (typeof builderOpt.absUrl === 'function') {
        // for dynamically generated url
        httpOpts['path'] = builderOpt.absUrl.apply( this, args);
      } else { httpOpts['path'] = builderOpt.absUrl;}      
    } 
    var req = http.request(httpOpts , cb);
    req.on('error', function(e) { cb(e); });
    
    // writing data
    var data = '';
    if (builderOpt.data != null) {
      data = builderOpt.data.apply( this, args);
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
  , absUrl: function() { return this.basePath + '/status' } 
  , cb: function(cb) { return callbackWithData(cb, 'value'); }  
});

webdriver.prototype._sessions = methodBuilder({
  method: 'GET'  
  , absUrl: function() { return this.basePath + '/sessions' } 
  , cb: function(cb) { return callbackWithData(cb, 'value'); }  
});


// alternate strategy to get session capabilities
// extract session capabilities from session list

webdriver.prototype.altSessionCapabilities = function(cb) {
  var _this = this;  
  // looking for the current session
  this._sessions( function(err, sessions) {
    if (err == null) {
      sessions = sessions.filter(function(session) {
        return session.id === _this.sessionID;
      });
      var _ref;
      return cb(null, (_ref = sessions[0]) != null ? _ref.capabilities : void 0);
    } else {
      return cb(err, sessions);
    }
  });
};

webdriver.prototype.sessionCapabilities = methodBuilder({
  method: 'GET'  
  // default url
  , cb: function(cb) { return callbackWithData(cb, 'value'); }  
});

webdriver.prototype.close = methodBuilder({
  method: 'DELETE'  
  , url:'/window'
});

webdriver.prototype.quit = methodBuilder({
  method: 'DELETE'  
  // default url
  , emit:{event:'status', message:"\nEnding your web drivage..\n"}
});

webdriver.prototype.eval = methodBuilder({
  method: 'POST'  
  , url:'/execute'
  , cb: function(code, cb) { return callbackWithData(cb, 'value'); }  
  , data: function(code) { return { script: "return " + code, args: [] }; }
});

webdriver.prototype.execute = methodBuilder({
  method: 'POST'  
  , url:'/execute'
  , cb: function(code, cb) { return callbackWithData(cb, 'value'); }
  , data: function(code) { return {script:code, args:[]}; }
});

webdriver.prototype.executeAsync = methodBuilder({
  method: 'POST'  
  , url:'/execute_async'
  , cb: function(code, cb) { return callbackWithData(cb, 'value'); }
  , data: function(code) { return {script:code, args:[]}; }
});

webdriver.prototype.get = methodBuilder({
  method: 'POST'  
  , url:'/url'
  , data: function(url) { return {"url":url}; }
});

webdriver.prototype.refresh = methodBuilder({
  method: 'POST'  
  , url:'/refresh'
});

webdriver.prototype.forward = methodBuilder({
  method: 'POST'  
  , url:'/forward'
});

webdriver.prototype.back = methodBuilder({
  method: 'POST'  
  , url:'/back'
});

webdriver.prototype.setImplicitWaitTimeout = methodBuilder({
  method: 'POST'  
  , url:'/timeouts/implicit_wait'
  , data: function(ms) { return {ms: ms}; }
});

// for backward compatibility 
webdriver.prototype.setWaitTimeout = webdriver.prototype.setImplicitWaitTimeout

webdriver.prototype.setAsyncScriptTimeout = methodBuilder({
  method: 'POST'  
  , url:'/timeouts/async_script'
  , data: function(ms) { return {ms: ms}; }
});

webdriver.prototype.setPageLoadTimeout = methodBuilder({
  method: 'POST'  
  , url:'/timeouts/timeouts'
  , data: function(ms) { return {type: 'page load', ms: ms}; }
});

webdriver.prototype.element = methodBuilder({
  method: 'POST'  
  , url:'/element'
  , cb: function(using, value, cb) { return elementCallback(cb); }
  , data: function(using, value) { return {using : using, value : value}; }
});

webdriver.prototype.elementByLinkText = function(value, cb) {
  this.element('link text', value, cb);
};

webdriver.prototype.elementById = function(value, cb) {
  this.element('id', value, cb);
};

webdriver.prototype.elementByName = function(value, cb) {
  this.element('name', value, cb);
};

webdriver.prototype.elementByCss = function(value, cb) {
  this.element('css selector', value, cb);
};

webdriver.prototype.elements = methodBuilder({
  method: 'POST'  
  , url:'/elements'
  , cb: function(using, value, cb) { return elementsCallback(cb); }
  , data: function(using, value) { return {using : using, value : value}; }
});

webdriver.prototype.elementsByLinkText = function(value, cb) {
  this.elements('link text', value, cb);
};

webdriver.prototype.elementsById = function(value, cb) {
  this.elements('id', value, cb);
};

webdriver.prototype.elementsByName = function(value, cb) {
  this.elements('name', value, cb);
};

webdriver.prototype.elementsByCss = function(value, cb) {
  this.elements('css selector', value, cb);
};

webdriver.prototype.getAttribute = methodBuilder({
  method: 'GET'  
  , url: function(element, attrName) { 
    return '/element/' + element + '/attribute/' + attrName; } 
  , cb: function(element, attrName, cb) { return callbackWithData(cb, 'value'); }
});

webdriver.prototype.getValue = function(element, cb) {
  this.getAttribute(element, 'value', cb);
};

webdriver.prototype.clickElement = methodBuilder({
  method: 'POST'  
  , url: function(element, attrName) { 
    return '/element/' + element + '/click'; } 
});

webdriver.prototype.moveTo = methodBuilder({
  method: 'POST'  
  , url:'/moveto'
  , data: function(element, xoffset, yoffset) { 
    return { element : element, xoffset : xoffset, yoffset : yoffset }; }
});

//@todo simulate the scroll event using dispatchEvent and browser.execute
/* it's not implemented so taking it out
webdriver.prototype.scroll = methodBuilder({
  method: 'POST'  
  , url:'/moveto'
  , data: function(element, xoffset, yoffset) { 
    return { element : element, xoffset : xoffset, yoffset : yoffset }; }
});
*/

webdriver.prototype.buttonDown = methodBuilder({
  method: 'POST'  
  , url:'/buttondown'
});

webdriver.prototype.buttonUp = methodBuilder({
  method: 'POST'  
  , url:'/buttonup'
});

//{LEFT = 0, MIDDLE = 1 , RIGHT = 2}
webdriver.prototype.click = methodBuilder({
  method: 'POST'  
  , url:'/click'
  , data: function(button) { return {button: button}; }
});


webdriver.prototype.doubleclick = methodBuilder({
  method: 'POST'  
  , url:'/doubleclick'
});

//All keys are up at end of command
webdriver.prototype.type = methodBuilder({
  method: 'POST'  
  , url: function(element, keys) { 
    return '/element/' + element + '/value'; } 
  , data: function(element, keys) { 
    if (!(keys instanceof Array)) {keys = [keys];}    
    return {value : keys}; 
  }
});

webdriver.prototype.clear = methodBuilder({
  method: 'POST'  
  , url: function(element) { return '/element/' + element + '/clear'; } 
});

webdriver.prototype.title = methodBuilder({
  method: 'GET'  
  , url:'/title'
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});

webdriver.prototype._text = methodBuilder({
  method: 'GET'
  , url: function(element) { return '/element/' + element + '/text'; } 
  , cb: function(element, cb) { return callbackWithData(cb, 'value'); }
});

webdriver.prototype.text = function(element, cb) {
  _this = this;
  if (typeof element === "undefined" || element == 'body' || element === null) {
    this.element('tag name', 'body', function(err, bodyEl) {
      if(err == null) {_this._text(bodyEl, cb);} else {cb(err);}
    });    
  }else{
    _this._text(element, cb);
  }  
}

webdriver.prototype.textPresent = function(searchText, element, cb) {
  this.text(element, function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(err, text.indexOf(searchText) >= 0);
    }
  });
}

webdriver.prototype.acceptAlert = methodBuilder({
  method: 'POST'  
  , url:'/accept_alert'
});

webdriver.prototype.dismissAlert = methodBuilder({
  method: 'POST'  
  , url:'/dismiss_alert'
});

webdriver.prototype.active = methodBuilder({
  method: 'POST'  
  , url:'/element/active'
  , cb: function(cb) { 
    return callbackWithData(function(e, o){ cb(null, o['ELEMENT'])}, 'value'); 
  }
});

webdriver.prototype.url = methodBuilder({
  method: 'GET'  
  , url:'/url'
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});


webdriver.prototype.allCookies = methodBuilder({
  method: 'GET'  
  , url:'/cookie'
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});

/*
cookie like the following:
  {name:'fruit', value:'apple'}
optional fields: path, domain, secure, expiry
check the JsonWire doc for details
*/
webdriver.prototype.setCookie = methodBuilder({
  method: 'POST'  
  , url:'/cookie'
  , data: function(cookie) { 
    // setting secure otherwise selenium server throws
    if ((typeof cookie !== "undefined" && cookie !== null) && 
      !((typeof cookie !== "undefined" && 
      cookie !== null ? cookie.secure : void 0) != null)) {
      cookie.secure = false;
    }
    return { cookie: cookie }; 
  }
});

webdriver.prototype.deleteAllCookies = methodBuilder({
  method: 'DELETE'  
  , url:'/cookie'
});

webdriver.prototype.deleteCookie = methodBuilder({
  method: 'DELETE'  
  , url: function(name) { 
    return '/cookie/' + encodeURIComponent(name); } 
});

// parses server parameters
parseRemoteWdConfig = function(args) {
  var accessKey, host, path, port, username, _ref;
  if (typeof (args != null ? args[0] : void 0) === 'object') {
    return args[0]
  } else {
    host = args[0], port = args[1], username = args[2], accessKey = args[3];
    return {
      host: host,
      port: port,
      username: username,
      accessKey: accessKey,
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
}

