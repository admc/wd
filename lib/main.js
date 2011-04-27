var http = require("http");

var strip = function strip(str){
	var x=[];
	for(var i in str){
		if (str.charCodeAt(i)){
			x.push(str.charAt(i));
		}
	}
	return x.join('');
}

var wd = function(host, port, username, accessKey) {
  this.sessionID = null;
  this.options = {
    host: host || '127.0.0.1'
    , port: port || 4444
    , path: '/wd/hub/session'
    , method: 'POST'
  };

  if(username && accessKey) {
    var authString = username+":"+accessKey;
    var buf = new Buffer(authString);
    this.options['headers'] = {
      'Authorization': 'Basic '+buf.toString('base64')
    }
    console.log(this.options.headers.Authorization);
  }
  
  this.desiredCapabilities = {
    browserName: "firefox"
    , version: "4"
    , javascriptEnabled: true
    , platform: "VISTA",
  }
  
  this.getOpts = function(over) {
    var opt = new Object();
    for (o in this.options) {
      opt[o] = this.options[o];
    }
    opt['path'] += this.sessionID;
    if (over.url) {
      opt['path'] += over.url;
    }
    if (over.method) {
      opt['method'] = over.method;
    }
    return opt;
  }
};

wd.prototype.init = function(desired) {
  var _this = this;
  
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
  if (desired && desired.username) {
    this.desiredCapabilities.username = desired.username;
  }
  if (desired && desired.accessKey) {
    this.desiredCapabilities.accessKey = desired.accessKey;
  }
  
  var req = http.request(_this.options, function(res) {
    res.on('end', function() {
      var locationArr = res.headers.location.split("/")
      _this.sessionID = locationArr[locationArr.length - 1];
    });
  });
  req.write(JSON.stringify({desiredCapabilities: _this.desiredCapabilities}));
  req.end();
};

wd.prototype.close = function(cb) {
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

wd.prototype.quit = function(cb) {
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

wd.prototype.exec = function(code, cb) {
  var _this = this;
  
  var req = http.request(  
    _this.getOpts({url:'/execute'}), function(res) {
      res.setEncoding('utf8');
      
      var data = "";
      res.on('data', function(chunk) { data += chunk.toString(); });
      res.on('end', function() {
        if (cb){ cb(JSON.parse(strip(data)).value); }
      });
  });
  
  req.write(JSON.stringify({script:"return window.eval('"+code+"');", args:[]}));
  req.end();
};

wd.prototype.url = function(url, cb) {
  var _this = this;  
  
  var req = http.request(
    _this.getOpts({url:'/url'}), function(res) {
      if (cb){ cb(); }
  });
  
  req.write(JSON.stringify({"url":url}));
  req.end();
};

exports.createWebDriver = function(host, port, username, accessKey) {
  return new wd(host, port, username, accessKey);
}
