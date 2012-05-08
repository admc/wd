var http = require("http");

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
 
var applyCommonHttpOpts = function(opt) {
  opt.headers = opt.headers || {}
  opt.headers['Connection'] = 'keep-alive';    
  if (opt.method === 'POST' || opt.method === 'GET')
    opt.headers['Accept'] = 'application/json';         
  if( opt.method == 'POST' )
    opt.headers['Content-Type'] = 'application/json';    
  return opt;
}
 
var init = function(desired, cb) {
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

  // http options
  var httpOpts = new Object();
  httpOpts.method = 'POST'
  for (var o in this.options) {
    httpOpts[o] = this.options[o];
  }
  if ((_this.username != null) && (_this.accessKey != null)) {
    var authString = _this.username + ":" + _this.accessKey;
    var buf = new Buffer(authString);
    httpOpts['headers'] = {
      'Authorization': 'Basic '+ buf.toString('base64')
    }
  }  
  applyCommonHttpOpts(httpOpts)
   
  var req = http.request(httpOpts, function(res) {
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
                
    // http options
    var httpOpts = new Object();
    for (var o in this.options) {
      httpOpts[o] = this.options[o];
    }
    httpOpts.method = builderOpt.method;
    applyCommonHttpOpts(httpOpts);
    
    // path
    var relPath = builderOpt.relPath;
    if (typeof relPath === 'function') {
      relPath = relPath.apply( this, args)};
    var absPath = builderOpt.absPath;
    if (typeof absPath === 'function') {
      absPath = builderOpt.absPath.apply( this, args)};    
    if(this.sessionID != null)
      httpOpts['path'] += '/'+this.sessionID;
    if (relPath) {
      httpOpts['path'] += relPath;
    }
    if (absPath) {
      httpOpts['path'] = absPath;
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
    
    // logging
    _this.emit('command', httpOpts['method'], 
      httpOpts['path'].replace(this.sessionID,':sessionID') 
        .replace(this.basePath, '')
      );
    
    // building request
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

exports.simpleCallback = simpleCallback;
exports.callbackWithData = callbackWithData;
exports.elementCallback = elementCallback;
exports.elementsCallback = elementsCallback;
exports.init = init;
exports.methodBuilder = methodBuilder;

