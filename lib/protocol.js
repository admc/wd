var fs = require('fs');
var builder = require('./builder');
var element = require('./element').element;

var methodBuilder = builder.methodBuilder
, callbackWithData = builder.callbackWithData
, elementCallback = builder.elementCallback
, elementsCallback = builder.elementsCallback
, __slice = Array.prototype.slice;

var protocol = {};

protocol.init = builder.init;

protocol.status = methodBuilder({
  method: 'GET'
  , absPath: function() { return this.basePath + '/status' }
  , cb: function(cb) { return callbackWithData(cb); }
});

protocol.sessions = methodBuilder({
  method: 'GET'
  , absPath: function() { return this.basePath + '/sessions' }
  , cb: function(cb) { return callbackWithData(cb); }
});


// alternate strategy to get session capabilities
// extract session capabilities from session list
protocol.altSessionCapabilities = function(cb) {
  var _this = this;
  // looking for the current session
  protocol.sessions.apply(this, [function(err, sessions) {
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

protocol.sessionCapabilities = methodBuilder({
  method: 'GET'
  // default url
  , cb: function(cb) { return callbackWithData(cb); }
});

protocol.close = methodBuilder({
  method: 'DELETE'
  , relPath: '/window'
});

protocol.quit = methodBuilder({
  method: 'DELETE'
  // default url
  , emit: {event: 'status', message: '\nEnding your web drivage..\n'}
});

protocol.eval = function(code, cb) {
  code = "return " + code + ";"
  protocol.execute.apply( this, [code, function(err, res) {    
    if(err!=null) {return cb(err);}
    cb(null, res);
  }]);
};

protocol.safeEval = function(code, cb) {
  protocol.safeExecute.apply( this, [code, function(err, res) {    
    if(err!=null) {return cb(err);}
    cb(null, res);
  }]);
};

protocol.execute = methodBuilder({
  method: 'POST'
  , relPath: '/execute'
  , cb: function() {
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];     
    
    return callbackWithData(cb); 
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

protocol.safeExecute = methodBuilder({
  method: 'POST'
  , relPath: '/execute'
  , cb: function() {
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];         
    return callbackWithData(cb); 
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

protocol.executeAsync = methodBuilder({
  method: 'POST'
  , relPath: '/execute_async'
  , cb: function() { 
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];     
  
    return callbackWithData(cb); 
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

protocol.safeExecuteAsync = methodBuilder({
  method: 'POST'
  , relPath: '/execute_async'
  , cb: function() { 
    // parsing args, cb at the end
    var cb, _args, _i;
    _args = 2 <= arguments.length ? __slice.call(arguments, 0, 
      _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];     
  
    return callbackWithData(cb); 
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

protocol.get = methodBuilder({
  method: 'POST'
  , relPath: '/url'
  , data: function(url) { return {'url': url}; }
});

protocol.refresh = methodBuilder({
  method: 'POST'
  , relPath: '/refresh'
});

protocol.forward = methodBuilder({
  method: 'POST'
  , relPath: '/forward'
});

protocol.back = methodBuilder({
  method: 'POST'
  , relPath: '/back'
});

protocol.setImplicitWaitTimeout = methodBuilder({
  method: 'POST'
  , relPath: '/timeouts/implicit_wait'
  , data: function(ms) { return {ms: ms}; }
});

// for backward compatibility
protocol.setWaitTimeout = protocol.setImplicitWaitTimeout;

protocol.setAsyncScriptTimeout = methodBuilder({
  method: 'POST'
  , relPath: '/timeouts/async_script'
  , data: function(ms) { return {ms: ms}; }
});

protocol.setPageLoadTimeout = methodBuilder({
  method: 'POST'
  , relPath: '/timeouts/timeouts'
  , data: function(ms) { return {type: 'page load', ms: ms}; }
});

protocol.element = methodBuilder({
  method: 'POST'
  , relPath: '/element'
  , cb: function(using, value, cb) { return elementCallback(cb); }
  , data: function(using, value) { return {using: using, value: value}; }
});

// avoid not found exception and return null instead
protocol.elementOrNull = function(using, value, cb) {
  protocol.elements.apply(this, [using, value, 
    function(err, elements) {
      if(err == null)
        if(elements.length>0) {cb(null,elements[0]);} else {cb(null,null);}
      else
        cb(err);
    }
  ]);
};

// avoid not found exception and return undefined instead
protocol.elementIfExists = function(using, value, cb) {
  protocol.elements.apply(this, [using, value, 
    function(err, elements) {
      if(err == null)
        if(elements.length>0) {cb(null,elements[0]);} else {cb(null,undefined);}
      else
        cb(err);
    }
  ]);
};

protocol.elements = methodBuilder({
  method: 'POST'
  , relPath: '/elements'
  , cb: function(using, value, cb) { return elementsCallback(cb); }
  , data: function(using, value) { return {using: using, value: value}; }
});

protocol.hasElement = function(using, value, cb){
  protocol.elements.apply( this, [using, value, function(err, elements){
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

    protocol['element' + elFuncSuffix(type)] = function(value, cb) {
      protocol.element.apply(this, [elFuncFullType(type), value, cb]);
    };
    
    // avoid not found exception and return null instead
    protocol['element' + elFuncSuffix(type)+ 'OrNull'] = function(value, cb) {
      protocol.elements.apply(this, [elFuncFullType(type), value, 
        function(err, elements) {
          if(err == null)
            if(elements.length>0) {cb(null,elements[0]);} else {cb(null,null);}
          else
            cb(err);
        }
      ]);
    };

    // avoid not found exception and return undefined instead
    protocol['element' + elFuncSuffix(type)+ 'IfExists'] = function(value, cb) {
      protocol.elements.apply(this, [elFuncFullType(type), value, 
        function(err, elements) {
          if(err == null)
            if(elements.length>0) {cb(null,elements[0]);} else {cb(null,undefined);}
          else
            cb(err);
        }
      ]);
    };

    protocol['hasElement' + elFuncSuffix(type)] = function(value, cb) {
      protocol.hasElement.apply(this, [elFuncFullType(type), value, cb]);
    };

    protocol['elements' + elFuncSuffix(type)] = function(value, cb) {
      protocol.elements.apply(this, [elFuncFullType(type), value, cb]);
    };
  
  })();
  
}

protocol.getAttribute = methodBuilder({
  method: 'GET'
  , relPath: function(element, attrName) {
    return '/element/' + element + '/attribute/' + attrName; }
  , cb: function(element, attrName, cb) { return callbackWithData(cb); }
});

protocol.getValue = function(element, cb) {
  protocol.getAttribute.apply(this, [element, 'value', cb]);
};

protocol.clickElement = methodBuilder({
  method: 'POST'
  , relPath: function(element, attrName) {
    return '/element/' + element + '/click'; }
});

protocol.moveTo = methodBuilder({
  method: 'POST'
  , relPath: '/moveto'
  , data: function(element, xoffset, yoffset) {
      return { element: element.toString(), xoffset: xoffset, yoffset: yoffset }; }
});

//@todo simulate the scroll event using dispatchEvent and browser.execute
/* it's not implemented so taking it out
protocol.scroll = methodBuilder({
  method: 'POST'
  , relPath:'/moveto'
  , data: function(element, xoffset, yoffset) {
    return { element : element, xoffset : xoffset, yoffset : yoffset }; }
});
*/

protocol.buttonDown = methodBuilder({
  method: 'POST'
  , relPath: '/buttondown'
});

protocol.buttonUp = methodBuilder({
  method: 'POST'
  , relPath: '/buttonup'
});

//{LEFT = 0, MIDDLE = 1 , RIGHT = 2}
protocol.click = methodBuilder({
  method: 'POST'
  , relPath: '/click'
  , data: function(button) { return {button: button}; }
});


protocol.doubleclick = methodBuilder({
  method: 'POST'
  , relPath: '/doubleclick'
});

//All keys are up at end of command
protocol.type = methodBuilder({
  method: 'POST'
  , relPath: function(element, keys) {
    return '/element/' + element + '/value'; }
  , data: function(element, keys) {
    if (!(keys instanceof Array)) {keys = [keys];}
    return {value: keys};
  }
});

protocol.keys = methodBuilder({
  method: 'POST'
  , relPath: '/keys'
  , data: function(keys) {
    if (!(keys instanceof Array)) {keys = [keys];}
    return {value: keys};
  }
});

protocol.clear = methodBuilder({
  method: 'POST'
  , relPath: function(element) { return '/element/' + element + '/clear'; }
});

protocol.title = methodBuilder({
  method: 'GET'
  , relPath: '/title'
  , cb: function(cb) { return callbackWithData(cb); }
});

// element must be specified
var _rawText = methodBuilder({
  method: 'GET'
  , relPath: function(element) { return '/element/' + element + '/text'; }
  , cb: function(element, cb) { return callbackWithData(cb); }
});

// element is specific element, 'body', or undefined
protocol.text = function(element, cb) {
  var _this = this;
  if (typeof element === 'undefined' || element == 'body' || element === null) {
    protocol.element.apply(this, ['tag name', 'body', function(err, bodyEl) {
      if (err == null) {_rawText.apply(_this, [bodyEl, cb]);} else {cb(err);}
    }]);
  }else {
    _rawText.apply(_this, [element, cb]);
  }
};

// element is specific element, 'body', or undefined
protocol.textPresent = function(searchText, element, cb) {
  protocol.text.apply(this, [element, function(err, text) {
    if (err) {
      cb(err, null);
    } else {
      cb(err, text.indexOf(searchText) >= 0);
    }
  }]);
};

protocol.acceptAlert = methodBuilder({
  method: 'POST'
  , relPath: '/accept_alert'
});

protocol.dismissAlert = methodBuilder({
  method: 'POST'
  , relPath: '/dismiss_alert'
});

protocol.active = methodBuilder({
  method: 'POST'
  , relPath: '/element/active'
  , cb: function(cb) {
    return callbackWithData(function(e, o) {
	var el = new element(o['ELEMENT'], this);
	cb(null, el)});
  }
});

protocol.url = methodBuilder({
  method: 'GET'
  , relPath: '/url'
  , cb: function(cb) { return callbackWithData(cb); }
});


protocol.allCookies = methodBuilder({
  method: 'GET'
  , relPath: '/cookie'
  , cb: function(cb) { return callbackWithData(cb); }
});

/*
cookie like the following:
  {name:'fruit', value:'apple'}
optional fields: path, domain, secure, expiry
check the JsonWire doc for details
*/
protocol.setCookie = methodBuilder({
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

protocol.deleteAllCookies = methodBuilder({
  method: 'DELETE'
  , relPath: '/cookie'
});

protocol.deleteCookie = methodBuilder({
  method: 'DELETE'
  , relPath: function(name) {
    return '/cookie/' + encodeURIComponent(name); }
});


// waitForCondition recursive implementation
var waitForConditionImpl = function(conditionExpr, limit, poll, cb) {
  var _this = this;

  // timeout check
  if (Date.now() < limit) {
    // condition check
    protocol.safeEval.apply( _this , [conditionExpr, function(err, res) {
      if(err != null) {return cb(err);}
      if (res == true) {
        // condition ok
        return cb(null, true);
      } else {        
        // wait for poll and try again
        setTimeout(function() {
          waitForConditionImpl.apply(_this, [conditionExpr, limit, poll, cb]);
        }, poll);        
      }      
    }]);
  } else {
    // try one last time
    protocol.safeEval.apply( _this, [conditionExpr, function(err, res) {
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
protocol.waitForCondition = function() {
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
  waitForConditionImpl.apply(this, [conditionExpr, limit, poll, cb]);
};

// script to be executed in browser
var waitForConditionInBrowserJsScript = fs.readFileSync( __dirname + "/browser-scripts/wait-for-cond-in-browser.js", 'utf8');

// args: (conditionExpr, timeout, poll, cb)
// timeout and poll are optional
protocol.waitForConditionInBrowser = function() {
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
  protocol.safeExecuteAsync.apply( _this, [waitForConditionInBrowserJsScript, 
    [conditionExpr,timeout,poll], function(err,res) {          
      if(err != null) {return cb(err);}
      if(res != true) {return cb("waitForConditionInBrowser failure for: " + conditionExpr);} 
      cb(null, res);  
    }
  ]);
};

module.exports = protocol;
