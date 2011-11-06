var http = require("http");

var strip = function strip(str) {
	var x = [];
	for(var i in str) {
		if (str.charCodeAt(i)) {
			x.push(str.charAt(i));
		}
	}
	return x.join('');
}

var webdriver = function(host, port, username, accessKey) {
  this.sessionID = null;
  this.options = {
    host: host || '127.0.0.1'
    , port: port || 4444
    , path: '/wd/hub/session'
    , method: 'POST'
  };  
  this.desiredCapabilities = {
    browserName: "firefox"
    , version: ""
    , javascriptEnabled: true
    , platform: "ANY",
  }
  
  if (username && accessKey) {
    var authString = username+":"+accessKey;
    var buf = new Buffer(authString);
    this.options['headers'] = {
      'Authorization': 'Basic '+ buf.toString('base64')
    }
    this.desiredCapabilities.platform = "VISTA";
  }
  
  this.getOpts = function(over) {
    var opt = new Object();
    for (o in this.options) {
      opt[o] = this.options[o];
    }
    opt['path'] += '/'+this.sessionID;
    if (over.url) {
      opt['path'] += over.url;
    }
    if (over.method) {
      opt['method'] = over.method;
    }
    return opt;
  }
};

webdriver.prototype.init = function(desired, cb) {
  var _this = this;

  //allow desired ovveride to be left out
  if (typeof desired == "function") {
    cb = desired;
    desired = null;
  }
    
  if (desired && desired.browserName) {
    this.desiredCapabilities.browserName = desired.browserName;
  }
  if (desired && desired.version) {
    this.desiredCapabilities.version = desired.version;
  }
  if (desired && desired.javascriptEnabled) {
    this.desiredCapabilities.javascriptEnabled = desired.javascriptEnabled;
  }
  if (desired && desired.platform) {
    this.desiredCapabilities.platform = desired.platform;
  }
  if (desired && desired.name) {
    this.desiredCapabilities.name = desired.name;
  }

  var req = http.request(_this.options, function(res) {
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
        return;
      }
      var locationArr = res.headers.location.split("/")
      _this.sessionID = locationArr[locationArr.length - 1];
      if (cb) { cb(null, _this.sessionID) }
    });
  });
  req.write(JSON.stringify({desiredCapabilities: _this.desiredCapabilities}));
  req.end();
};

webdriver.prototype.close = function(cb) {
  var _this = this;
  var req = http.request(
    _this.getOpts(
      {url:'/window', method:'DELETE'}
    ), function(res) {
      if (cb){ cb(); }
    });
  
  req.write("");
  req.end();
}

webdriver.prototype.quit = function(cb) {
  var _this = this;
  var req = http.request(
    _this.getOpts(
      {method:'DELETE'}
    ), function(res) {
      if (cb){ cb(); }
    });
  
  req.write("");
  req.end();
}

webdriver.prototype.eval = function(code, cb) {
  var _this = this;
  
  var req = http.request(  
    _this.getOpts({url:'/execute'}), function(res) {
      res.setEncoding('utf8');
      
      var data = "";
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        if (cb){ cb(null, JSON.parse(strip(data)).value); }
      });
  });
  
  req.write(JSON.stringify({script:"return "+code, args:[]}));
  req.end();
};

webdriver.prototype.execute = function(code, cb) {
  var _this = this;
  
  var req = http.request(  
    _this.getOpts({url:'/execute'}), function(res) {
      res.setEncoding('utf8');
      
      var data = "";
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        if (cb){ cb(null, JSON.parse(strip(data)).value); }
      });
  });
  
  req.write(JSON.stringify({script:code, args:[]}));
  req.end();
};

webdriver.prototype.executeAsync = function(code, cb) {
  var _this = this;
  
  var req = http.request(  
    _this.getOpts({url:'/execute_async'}), function(res) {
      res.setEncoding('utf8');
      
      var data = "";
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        if (cb){ cb(null, JSON.parse(strip(data)).value); }
      });
  });
  
  req.write(JSON.stringify({script:code, args:[]}));
  req.end();
};

webdriver.prototype.get = function(url, cb) {
  var _this = this;  
  
  var req = http.request(
    _this.getOpts({url:'/url'}), function(res) {
      if (cb){ cb(); }
  });
  
  req.write(JSON.stringify({"url":url}));
  req.end();
};

webdriver.prototype.setWaitTimeout = function(ms, cb) {
    var _this = this;  
    
    var req = http.request(
    _this.getOpts({url:'/timeouts/implicit_wait'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({ms: ms}));
    req.end();
};


webdriver.prototype.element = function(using, value, cb) {
    var _this = this;  
    
    var req = http.request(  
      _this.getOpts({url:'/element'}), function(res) {
        res.setEncoding('utf8');
        
        var data = "";
        res.on('data', function(chunk) { data += chunk.toString(); });
        res.on('end', function() {
            var obj = JSON.parse(strip(data));
            if (!obj.value.ELEMENT)
                cb(data, null);
            else if (cb){ cb(null, obj.value.ELEMENT); }
        });
    });
    
    req.write(JSON.stringify({
        using : using,
        value : value
    }));
    req.end();
};

webdriver.prototype.moveTo = function(element, xoffset, yoffset, cb) {
    var _this = this;  
    
    var req = http.request(
      _this.getOpts({url:'/moveto'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({
        element : element,
        xoffset : xoffset,
        yoffset : yoffset
    }));
    req.end();
};

//@todo simulate the scroll event using dispatchEvent and browser.execute
webdriver.prototype.scroll = function(element, xoffset, yoffset, cb) {
    var _this = this;  
    
    var req = http.request(
      _this.getOpts({url:'/moveto'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({
        element : element,
        xoffset : xoffset,
        yoffset : yoffset
    }));
    req.end();
};

webdriver.prototype.buttonDown = function(cb) {
    var _this = this;  
    
    var req = http.request(
    _this.getOpts({url:'/buttondown'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({}));
    req.end();
};


webdriver.prototype.buttonUp = function(cb) {
    var _this = this;  
    
    var req = http.request(
      _this.getOpts({url:'/buttonup'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({}));
    req.end();
};

//{LEFT = 0, MIDDLE = 1 , RIGHT = 2}
webdriver.prototype.click = function(button, cb) {
    var _this = this;  
    
    var req = http.request(
      _this.getOpts({url:'/click'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({
        button: button
    }));
    req.end();
};

webdriver.prototype.doubleclick = function(button, cb) {
    var _this = this;
    
    var req = http.request(
      _this.getOpts({url:'/doubleclick'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({}));
    req.end();
};

//All keys are up at end of command
webdriver.prototype.type = function(element, keys, cb) {
    var _this = this;  
    
    var req = http.request(
      _this.getOpts({url:'/element/' + element + '/value'}), function(res) {
        if (cb){ cb(); }
    });
    
    req.write(JSON.stringify({
        value : keys
    }));
    req.end();
};


exports.remote = function(host, port, username, accessKey) {
  return new webdriver(host, port, username, accessKey);
}
