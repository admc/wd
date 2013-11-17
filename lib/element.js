//Element object
//Wrapper around browser methods
var __slice = Array.prototype.slice;
var _ = require("./lodash")
  , utils = require("./utils.js")
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
 * Element.type(keys, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/value
 */
Element.prototype.type = function (keys, cb) {
  return this.browser.type(this, keys, cb);
};

/**
 * Element.keys(keys, cb) -> cb(err)
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
 * Element.sendKeys(keys, cb) -> cb(err)
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
 * Element.click(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/click
 */
Element.prototype.click = function (cb) {
  return this.browser.clickElement(this, cb);
};

/**
 * Element.tap(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/touch/click
 */
Element.prototype.tap = function (cb) {
  return this.browser.tapElement(this, cb);
};

/**
 * Element.doubleClick(cb) -> cb(err)
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
 * Element.moveTo(xoffset, yoffset, cb) -> cb(err)
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
 * Element.flick(xoffset, yoffset, speed, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/touch/flick
 */
Element.prototype.flick = function (xoffset, yoffset, speed, cb) {
  return this.browser.flick(this.value, xoffset, yoffset, speed, cb);
};


/**
 * Element.text(cb) -> cb(err, text)
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 2
 */
Element.prototype.text = function (cb) {
  return this.browser.text(this, cb);
};

/**
 * Element.textPresent(searchText, cb) -> cb(err, boolean)
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 4
 */
Element.prototype.textPresent = function(searchText, cb) {
  return this.browser.textPresent(searchText, this, cb);
};

/**
 * Element.getAttribute(attrName, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 2
 */
Element.prototype.getAttribute = function(name, cb) {
  return this.browser.getAttribute(this, name, cb);
};

/**
 * Element.getTagName(cb) -> cb(err, name)
 *
 * @jsonWire GET /session/:sessionId/element/:id/name
 */
Element.prototype.getTagName = function(cb) {
  return this.browser.getTagName(this, cb);
};

/**
 * Element.isDisplayed(cb) -> cb(err, displayed)
 *
 * @jsonWire GET /session/:sessionId/element/:id/displayed
 */
Element.prototype.isDisplayed = function(cb) {
  return this.browser.isDisplayed(this, cb);
};

Element.prototype.displayed = Element.prototype.isDisplayed;

/**
 * Element.isSelected(cb) -> cb(err, selected)
 *
 * @jsonWire GET /session/:sessionId/element/:id/selected
 */
Element.prototype.isSelected = function(cb) {
  return this.browser.isSelected(this, cb);
};

Element.prototype.selected = Element.prototype.isSelected;

/**
  * Element.isEnabled(cb) -> cb(err, enabled)
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
  return this.browser.isVisible(this, cb);
};

/**
 * Element.getLocation(cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location
 */
Element.prototype.getLocation = function (cb) {
  return this.browser.getLocation(this, cb);
};

/**
 * Element.getLocationInView(cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location
 */
Element.prototype.getLocationInView = function (cb) {
  return this.browser.getLocationInView(this, cb);
};

/**
 * Element.getSize(cb) -> cb(err, size)
 *
 * @jsonWire GET /session/:sessionId/element/:id/size
 */
Element.prototype.getSize = function (cb) {
  return this.browser.getSize(this, cb);
};

/**
 * Element.getValue(cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 4
 */
Element.prototype.getValue = function(cb) {
  return this.browser.getValue(this, cb);
};

/**
 * Element.getComputedCss(cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
Element.prototype.getComputedCss = function(styleName, cb) {
  return this.browser.getComputedCss(this, styleName, cb);
};

Element.prototype.getComputedCSS = Element.prototype.getComputedCss;

/**
 * Element.clear(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/clear
 */
Element.prototype.clear = function(cb) {
  return this.browser.clear(this, cb);
};

/**
 * Element.submit(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/submit
 */
Element.prototype.submit = function(cb) {
  return this.browser.submit(this, cb);
};

/**
 * Element.getComputedCss(cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
Element.prototype.getComputedCss = function(styleName, cb) {
    return this.browser.getComputedCss(this, styleName, cb);
};

_.each(utils.elementFuncTypes, function(type) {
  /**
   * Element.elementByClassName(value, cb) -> cb(err, Element)
   * Element.elementByCssSelector(value, cb) -> cb(err, Element)
   * Element.elementById(value, cb) -> cb(err, Element)
   * Element.elementByName(value, cb) -> cb(err, Element)
   * Element.elementByLinkText(value, cb) -> cb(err, Element)
   * Element.elementByPartialLinkText(value, cb) -> cb(err, Element)
   * Element.elementByTagName(value, cb) -> cb(err, Element)
   * Element.elementByXPath(value, cb) -> cb(err, Element)
   * Element.elementByCss(value, cb) -> cb(err, Element)
   *
   * @jsonWire POST /session/:sessionId/element/:id/element
   * @docOrder 2
   */
  Element.prototype['element' + utils.elFuncSuffix(type)] = function(value, cb) {
    this.element(utils.elFuncFullType(type), value, cb);
  };

  /**
   * Element.elementsByClassName(value, cb) -> cb(err, elements)
   * Element.elementsByCssSelector(value, cb) -> cb(err, elements)
   * Element.elementsById(value, cb) -> cb(err, elements)
   * Element.elementsByName(value, cb) -> cb(err, elements)
   * Element.elementsByLinkText(value, cb) -> cb(err, elements)
   * Element.elementsByPartialLinkText(value, cb) -> cb(err, elements)
   * Element.elementsByTagName(value, cb) -> cb(err, elements)
   * Element.elementsByXPath(value, cb) -> cb(err, elements)
   * Element.elementsByCss(value, cb) -> cb(err, elements)
   *
   * @jsonWire POST /session/:sessionId/element/:id/elements
   * @docOrder 2
   */
  Element.prototype['elements' + utils.elFuncSuffix(type)] = function(value, cb) {
    this.elements(utils.elFuncFullType(type), value, cb);
  };
});

/**
 * Element.element(using, value, cb) -> cb(err, Element)
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
 * Element.elements(using, value, cb) -> cb(err, elements)
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
 * Element.equals(other, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/equals/:other
 * @docOrder 1
 */
Element.prototype.equals = function(other, cb) {
  return this.browser.equalsElement(this, other, cb);
};

/**
 * Element.sleep(ms, cb) -> cb(err)
 */
Element.prototype.sleep = function(ms, cb) {
  cb = cb || function() {};
  setTimeout(cb , ms);
};

/**
 * Element.noop(cb) -> cb(err)
 */
Element.prototype.noop = function(cb) {
  if(cb) { cb(); }
};

module.exports = Element;
