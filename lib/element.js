//Element object
//Wrapper around browser methods
var __slice = Array.prototype.slice;
var _ = require("./lodash")
  , utils = require("./utils.js")
  , deprecator = utils.deprecator
  , fs = require("fs");

var Element = function(value, browser) {
  this.value = value;
  this.browser = browser;

  if(!value){
    throw new Error("no value passed to Element constructor");
  }

  if(!browser){
    throw new Error("no browser passed to Element constructor");
  }
};

Element.prototype.emit = function() {
  this.browser.emit.apply(this.browser, __slice.call(arguments, 0));
};

Element.prototype.toString = function () {
  return String(this.value);
};

Element.prototype.toJSON = function () {
  return { ELEMENT: this.value };
};

/**
 * element.type(keys, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/value
 */
Element.prototype.type = function (keys, cb) {
  return this.browser.type(this, keys, cb);
};

/**
 * element.keys(keys, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/value
 */
Element.prototype.keys = function (keys, cb) {
  return this.browser.keys(keys, cb);
};

function _isLocalFile(path, cb) {
  fs.exists(path, function (exists) {
    if(exists) {
      fs.lstat(path, function (err, stats) {
       cb(err, stats.isFile());
      });
    } else { cb(null, false); }
  });
}

/**
 * Equivalent to the python sendKeys binding. Upload file if
 * a local file is detected, otherwise behaves like type.
 * element.sendKeys(keys, cb) -> cb(err)
 */
Element.prototype.sendKeys = function (keys, cb) {
  var _this = this;
  if (!(keys instanceof Array)) {keys = [keys];}

  // ensure all keystrokes are strings to conform to JSONWP
  _.each(keys, function(key, idx) {
    if (typeof key !== "string") {
      keys[idx] = key.toString();
    }
  });

  var path = keys.join('');
  _isLocalFile(path, function (err, isLocalFile) {
    if(err){ return cb(err); }
    if(isLocalFile) {
      _this.browser.uploadFile(path, function (err, distantFilePath) {
        if(err){ return cb(err); }
        return _this.browser.type(_this, distantFilePath, cb);
      });
    } else {
      return _this.browser.type(_this, keys, cb);
    }
  });
};

/**
 * element.click(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/click
 */
Element.prototype.click = function (cb) {
  return this.browser.clickElement(this, cb);
};

/**
 * element.tap(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/touch/click
 */
Element.prototype.tap = function (cb) {
  return this.browser.tapElement(this, cb);
};

/**
 * element.doubleClick(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/doubleclick
 */
Element.prototype.doubleclick = function(cb) {
  return this.browser.moveTo(this, function(err) {
    if(err) { return cb(err); }
    this.browser.doubleclick(cb);
  }.bind(this));
};

Element.prototype.doubleClick = Element.prototype.doubleclick;

/**
 * element.moveTo(xoffset, yoffset, cb) -> cb(err)
 * xoffset and y offset are optional.
 *
 * @jsonWire POST /session/:sessionId/moveto
 */
Element.prototype.moveTo = function() {
  var fargs = utils.varargs(arguments);
  var cb = fargs.callback,
      xoffset = fargs.all[0],
      yoffset = fargs.all[1];
  return this.browser.moveTo(this,xoffset, yoffset, cb);
};

/**
 * element.flick(xoffset, yoffset, speed, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/touch/flick
 */
Element.prototype.flick = function (xoffset, yoffset, speed, cb) {
  return this.browser.flick(this.value, xoffset, yoffset, speed, cb);
};


/**
 * element.text(cb) -> cb(err, text)
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 2
 */
Element.prototype.text = function (cb) {
  return this.browser.text(this, cb);
};

/**
 * element.textPresent(searchText, cb) -> cb(err, boolean)
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 4
 */
Element.prototype.textPresent = function(searchText, cb) {
  return this.browser.textPresent(searchText, this, cb);
};

/**
 * element.getAttribute(attrName, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 2
 */
Element.prototype.getAttribute = function(name, cb) {
  return this.browser.getAttribute(this, name, cb);
};

/**
 * element.getTagName(cb) -> cb(err, name)
 *
 * @jsonWire GET /session/:sessionId/element/:id/name
 */
Element.prototype.getTagName = function(cb) {
  return this.browser.getTagName(this, cb);
};

/**
 * element.isDisplayed(cb) -> cb(err, displayed)
 *
 * @jsonWire GET /session/:sessionId/element/:id/displayed
 */
Element.prototype.isDisplayed = function(cb) {
  return this.browser.isDisplayed(this, cb);
};

Element.prototype.displayed = Element.prototype.isDisplayed;

/**
 * element.isSelected(cb) -> cb(err, selected)
 *
 * @jsonWire GET /session/:sessionId/element/:id/selected
 */
Element.prototype.isSelected = function(cb) {
  return this.browser.isSelected(this, cb);
};

Element.prototype.selected = Element.prototype.isSelected;

/**
  * element.isEnabled(cb) -> cb(err, enabled)
  *
  * @jsonWire GET /session/:sessionId/element/:id/enabled
  */
Element.prototype.isEnabled = function(cb) {
  return this.browser.isEnabled(this, cb);
};

Element.prototype.enabled = Element.prototype.isEnabled;

/**
 * isVisible(cb) -> cb(err, boolean)
 */
Element.prototype.isVisible = function(cb) {
  deprecator.warn('element.isVisible', 'element.isVisible has been deprecated, use element.isDisplayed instead.');  
  return this.browser.isVisible(this, cb);
};

/**
 * element.getLocation(cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location
 */
Element.prototype.getLocation = function (cb) {
  return this.browser.getLocation(this, cb);
};

/**
 * element.getLocationInView(cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location
 */
Element.prototype.getLocationInView = function (cb) {
  return this.browser.getLocationInView(this, cb);
};

/**
 * element.getSize(cb) -> cb(err, size)
 *
 * @jsonWire GET /session/:sessionId/element/:id/size
 */
Element.prototype.getSize = function (cb) {
  return this.browser.getSize(this, cb);
};

/**
 * element.getValue(cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 4
 */
Element.prototype.getValue = function(cb) {
  return this.browser.getValue(this, cb);
};

/**
 * element.getComputedCss(cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
Element.prototype.getComputedCss = function(styleName, cb) {
  return this.browser.getComputedCss(this, styleName, cb);
};

Element.prototype.getComputedCSS = Element.prototype.getComputedCss;

/**
 * element.clear(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/clear
 */
Element.prototype.clear = function(cb) {
  return this.browser.clear(this, cb);
};

/**
 * element.submit(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/submit
 */
Element.prototype.submit = function(cb) {
  return this.browser.submit(this, cb);
};

/**
 * element.getComputedCss(cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
Element.prototype.getComputedCss = function(styleName, cb) {
    return this.browser.getComputedCss(this, styleName, cb);
};

_.each(utils.elementFuncTypes, function(type) {
  /**
   * element.elementByClassName(value, cb) -> cb(err, element)
   * element.elementByCssSelector(value, cb) -> cb(err, element)
   * element.elementById(value, cb) -> cb(err, element)
   * element.elementByName(value, cb) -> cb(err, element)
   * element.elementByLinkText(value, cb) -> cb(err, element)
   * element.elementByPartialLinkText(value, cb) -> cb(err, element)
   * element.elementByTagName(value, cb) -> cb(err, element)
   * element.elementByXPath(value, cb) -> cb(err, element)
   * element.elementByCss(value, cb) -> cb(err, element)
   *
   * @jsonWire POST /session/:sessionId/element/:id/element
   * @docOrder 2
   */
  Element.prototype['element' + utils.elFuncSuffix(type)] = function(value, cb) {
    this.element(utils.elFuncFullType(type), value, cb);
  };

  /**
   * element.elementsByClassName(value, cb) -> cb(err, elements)
   * element.elementsByCssSelector(value, cb) -> cb(err, elements)
   * element.elementsById(value, cb) -> cb(err, elements)
   * element.elementsByName(value, cb) -> cb(err, elements)
   * element.elementsByLinkText(value, cb) -> cb(err, elements)
   * element.elementsByPartialLinkText(value, cb) -> cb(err, elements)
   * element.elementsByTagName(value, cb) -> cb(err, elements)
   * element.elementsByXPath(value, cb) -> cb(err, elements)
   * element.elementsByCss(value, cb) -> cb(err, elements)
   *
   * @jsonWire POST /session/:sessionId/element/:id/elements
   * @docOrder 2
   */
  Element.prototype['elements' + utils.elFuncSuffix(type)] = function(value, cb) {
    this.elements(utils.elFuncFullType(type), value, cb);
  };
});

/**
 * element.element(using, value, cb) -> cb(err, element)
 *
 * @jsonWire POST /session/:sessionId/element/:id/element
 * @docOrder 1
 */
Element.prototype.element = function(using, value, cb) {
    var _this = this;
    this.browser._jsonWireCall({
      method: 'POST'
      , relPath: '/element/' + _this.value + '/element'
      , data: {using: using, value: value}
      , cb: this.browser._elementCallback(cb)
    });
};

/**
 * element.elements(using, value, cb) -> cb(err, elements)
 *
 * @jsonWire POST /session/:sessionId/element/:id/elements
 * @docOrder 1
 */
Element.prototype.elements = function(using, value, cb) {
    var _this = this;
    this.browser._jsonWireCall({
      method: 'POST'
      , relPath: '/element/' + _this.value + '/elements'
      , data: {using: using, value: value}
      , cb: this.browser._elementsCallback(cb)
    });
};

/**
 * element.equals(other, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/equals/:other
 * @docOrder 1
 */
Element.prototype.equals = function(other, cb) {
  return this.browser.equalsElement(this, other, cb);
};

/**
 * element.sleep(ms, cb) -> cb(err)
 */
Element.prototype.sleep = function(ms, cb) {
  cb = cb || function() {};
  setTimeout(cb , ms);
};

/**
 * element.noop(cb) -> cb(err)
 */
Element.prototype.noop = function(cb) {
  if(cb) { cb(); }
};

module.exports = Element;
