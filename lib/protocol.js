var builder = require('./builder');

var methodBuilder = builder.methodBuilder
, callbackWithData = builder.callbackWithData
, elementCallback = builder.elementCallback
, elementsCallback = builder.elementsCallback;

var protocol = {};

protocol.init = builder.init;

protocol.status = methodBuilder({
  method: 'GET'
  , absPath: function() { return this.basePath + '/status' }
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});

// hiding implementation
_sessions = methodBuilder({
  method: 'GET'
  , absPath: function() { return this.basePath + '/sessions' }
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});


// alternate strategy to get session capabilities
// extract session capabilities from session list
protocol.altSessionCapabilities = function(cb) {
  var _this = this;
  // looking for the current session
  _sessions.apply(this, [function(err, sessions) {
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
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
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

protocol.eval = methodBuilder({
  method: 'POST'
  , relPath: '/execute'
  , cb: function(code, cb) { return callbackWithData(cb, 'value'); }
  , data: function(code) { return { script: 'return ' + code, args: [] }; }
});

protocol.execute = methodBuilder({
  method: 'POST'
  , relPath: '/execute'
  , cb: function(code, cb) { return callbackWithData(cb, 'value'); }
  , data: function(code) { return {script: code, args: []}; }
});

protocol.executeAsync = methodBuilder({
  method: 'POST'
  , relPath: '/execute_async'
  , cb: function(code, cb) { return callbackWithData(cb, 'value'); }
  , data: function(code) { return {script: code, args: []}; }
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

// hiding implementation
_element = methodBuilder({
  method: 'POST'
  , relPath: '/element'
  , cb: function(using, value, cb) { return elementCallback(cb); }
  , data: function(using, value) { return {using: using, value: value}; }
});

protocol.element = function(using, value, cb) {
  _element.apply(this, [using, value, cb]);
};

protocol.elementByLinkText = function(value, cb) {
  _element.apply(this, ['link text', value, cb]);
};

protocol.elementById = function(value, cb) {
  _element.apply(this, ['id', value, cb]);
};

protocol.elementByName = function(value, cb) {
  _element.apply(this, ['name', value, cb]);
};

protocol.elementByCss = function(value, cb) {
  _element.apply(this, ['css selector', value, cb]);
};

// hiding implementation
_elements = methodBuilder({
  method: 'POST'
  , relPath: '/elements'
  , cb: function(using, value, cb) { return elementsCallback(cb); }
  , data: function(using, value) { return {using: using, value: value}; }
});

protocol.elements = function(using, value, cb) {
  _elements.apply(this, [using, value, cb]);
};

protocol.elementsByLinkText = function(value, cb) {
  _elements.apply(this, ['link text', value, cb]);
};

protocol.elementsById = function(value, cb) {
  _elements.apply(this, ['id', value, cb]);
};

protocol.elementsByName = function(value, cb) {
  _elements.apply(this, ['name', value, cb]);
};

protocol.elementsByCss = function(value, cb) {
  _elements.apply(this, ['css selector', value, cb]);
};

// hiding implementation
_getAttribute = methodBuilder({
  method: 'GET'
  , relPath: function(element, attrName) {
    return '/element/' + element + '/attribute/' + attrName; }
  , cb: function(element, attrName, cb) { return callbackWithData(cb, 'value'); }
});

protocol.getAttribute = function(element, attrName, cb) {
  _getAttribute.apply(this, [element, attrName, cb]);
};

protocol.getValue = function(element, cb) {
  _getAttribute.apply(this, [element, 'value', cb]);
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
    return { element: element, xoffset: xoffset, yoffset: yoffset }; }
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

protocol.clear = methodBuilder({
  method: 'POST'
  , relPath: function(element) { return '/element/' + element + '/clear'; }
});

protocol.title = methodBuilder({
  method: 'GET'
  , relPath: '/title'
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});

// element must be specified
_rawText = methodBuilder({
  method: 'GET'
  , relPath: function(element) { return '/element/' + element + '/text'; }
  , cb: function(element, cb) { return callbackWithData(cb, 'value'); }
});

// element is specific element, 'body', or undefined
// hiding implementation
_text = function(element, cb) {
  var _this = this;
  if (typeof element === 'undefined' || element == 'body' || element === null) {
    _element.apply(this, ['tag name', 'body', function(err, bodyEl) {
      if (err == null) {_rawText.apply(_this, [bodyEl, cb]);} else {cb(err);}
    }]);
  }else {
    _rawText.apply(_this, [element, cb]);
  }
};

// element is specific element, 'body', or undefined
protocol.text = function(element, cb) {
  _text.apply(this, [element, cb]);
};

// element is specific element, 'body', or undefined
protocol.textPresent = function(searchText, element, cb) {
  _text.apply(this, [element, function(err, text) {
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
    return callbackWithData(function(e, o) { cb(null, o['ELEMENT'])}, 'value');
  }
});

protocol.url = methodBuilder({
  method: 'GET'
  , relPath: '/url'
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
});


protocol.allCookies = methodBuilder({
  method: 'GET'
  , relPath: '/cookie'
  , cb: function(cb) { return callbackWithData(cb, 'value'); }
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

module.exports = protocol;
