var http = require("http");

var strip = function strip(str) {
	var x = [];
	for(var i = 0; i<str.length; i++) {
		if (str.charCodeAt(i)) {
			x.push(str.charAt(i));
		}
	}
	return x.join('');
}


var callbackWithData = function(cb, objKey){
  return function(res) {
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
        cb(null, objKey ? obj[objKey] : obj);
      }
    });
  }
}

var webdriver = function(host, port, username, accessKey) {
  this.sessionID = null;
  this.options = {
    host: host || '127.0.0.1'
    , port: port || 4444
    , path: '/wd/hub/session'
    , method: 'POST'
    , headers: {
      'Connection': 'keep-alive'
    }
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
    for (var o in this.options) {
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

webdriver.prototype.defaultElement = function(element, cb) {
  if (typeof element === "undefined" || element == 'body' || element === null) {
    this.element('tag name', 'body', function(err, el) {
      cb(el);
    });
  } else {
    cb(element);
  }
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
    _this.getOpts({url:'/execute'})
    , callbackWithData(cb, 'value'));

  req.write(JSON.stringify({script:"return "+code, args:[]}));
  req.end();
};

webdriver.prototype.execute = function(code, cb) {
  var _this = this;

  var req = http.request(
    _this.getOpts({url:'/execute'})
    , callbackWithData(cb, 'value'));

  req.write(JSON.stringify({script:code, args:[]}));
  req.end();
};

webdriver.prototype.executeAsync = function(code, cb) {
  var _this = this;

  var req = http.request(
    _this.getOpts({url:'/execute_async'})
    , callbackWithData(cb, 'value'));

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

webdriver.prototype.refresh = function(cb) {
  var _this = this;
  var req = http.request(
    _this.getOpts({url: '/refresh'}),
    function(res) {
      if (cb){ cb(); }
    }
  );
  req.write('');
  req.end();
}

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
          try{
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
    });

    req.write(JSON.stringify({
        using : using,
        value : value
    }));
    req.end();
};

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

webdriver.prototype.getAttribute = function(element, attrName, cb) {
  var _this = this;
  var opts = {
    url:'/element/' + element + '/attribute/' + attrName,
    method: "GET"
  };
  var req = http.request(_this.getOpts(opts), callbackWithData(cb, 'value'));
  req.write('');
  req.end();
};

webdriver.prototype.getValue = function(element, cb) {
  this.getAttribute(element, 'value', cb);
};

webdriver.prototype.clickElement = function(element, cb) {
    var _this = this;

    var req = http.request(
        _this.getOpts({url: '/element/' + element + '/click'}),
        function(res) {
            if (cb) { cb(); }
        }
    );

    req.write('');
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

    if (!(keys instanceof Array))
      keys = [keys];

    var req = http.request(
      _this.getOpts({url:'/element/' + element + '/value'}), function(res) {
        if (cb){ cb(); }
    });

    req.write(JSON.stringify({
        value : keys
    }));
    req.end();
};

webdriver.prototype.clear = function(element, cb) {
    var _this = this;
    var req = http.request(
        _this.getOpts({url: '/element/' + element + '/clear'}),
        function(res) {
            cb();
        }
    );
    req.write('');
    req.end();
};

webdriver.prototype.title = function(cb) {
    var _this = this;
    var opts = {url:'/title', method: "GET"};
    var req = http.request(_this.getOpts(opts), callbackWithData(cb, 'value'));
    req.write('');
    req.end();
};

webdriver.prototype.text = function(element, cb) {
    var _this = this;

    var doTextReq = function(el) {
        var url = _this.getOpts({
            url: '/element/' + el + '/text',
            method: "GET"
        });
        var req = http.request(url, callbackWithData(cb, 'value'));
        req.write('');
        req.end();
    };

    this.defaultElement(element, doTextReq);
};

webdriver.prototype.textPresent = function(searchText, cb, element) {
  this.text(element, function(err, text) {
    if (err) {
        cb(err, null);
    } else {
      cb(err, text.indexOf(searchText) >= -1);
    }
  });
}

webdriver.prototype.dismiss_alert = function(cb) {
    var _this = this;

    var req = http.request(
      _this.getOpts({url:'/dismiss_alert'}), function(res) {
        if (cb){ cb(); }
    });

    req.write(JSON.stringify({}));
    req.end();
};

webdriver.prototype.active = function(cb){
  var req = http.request(
    this.getOpts({url:'/element/active'}), callbackWithData(function(e, o){
      cb(null, o['ELEMENT'])
    }, 'value'));

  req.end();
}

webdriver.prototype.keyToggle = function(element, keys, cb) {
    var _this = this;

    var req = http.request(
      _this.getOpts({url:'/type'}), function(res) {
        if (cb){ cb(); }
    });

    req.write(JSON.stringify({
        value : keys
    }));
    req.end();
};

webdriver.prototype.url = function(cb) {
    var _this = this;
    var url = _this.getOpts({url:'/url', method: "GET"});
    var req = http.request(url, callbackWithData(cb, 'value'));
    req.write('');
    req.end();
}

webdriver.prototype.setCookie = function(name, cookie, cb) {
    var _this = this;
    var url = _this.getOpts({url: '/cookie/' + name, method: 'POST'});
    var body = { cookie: cookie };
    var req = http.request(url, function() {
        if (cb) {
            cb();
        }
    });
    req.write(JSON.stringify(body));
    req.end();
};


exports.remote = function(host, port, username, accessKey) {
  return new webdriver(host, port, username, accessKey);
}
