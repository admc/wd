//Element object
//Wrapper around browser methods
var _ = require("underscore")
  , utils = require("./utils.js")
  , fs = require("fs");

var element = function(value, browser) {
    this.value = value;
    this.browser = browser;

    if(!value){
      throw new Error("no value passed to element constructor");
    }

    if(!browser){
      throw new Error("no browser passed to element constructor");
    }
};

element.prototype.toString = function () {
    return String(this.value);
};

/**
 * element.type(keys, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/value
 */
element.prototype.type = function (keys, cb) {
    return this.browser.type(this, keys, cb);
};

/**
 * Equivalent to the python sendKeys binding. Upload file if 
 * a local file is detected, otherwise behaves like type.
 * element.sendKeys(keys, cb) -> cb(err)
 */
element.prototype.sendKeys = function (keys, cb) {
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
    if(err) return cb(err);
    if(isLocalFile) {
      _this.browser.uploadFile(path, function (err, filepath) {
        if(err) return cb(err);
        return _this.browser.type(_this, keys, cb);
      });
    } else {
      return _this.browser.type(_this, keys, cb);
    }
  });
};

function _isLocalFile(path, cb) {
  fs.exists(path, function (exists) {
    if(exists) {
      fs.lstat(path, function (err, stats) {
       cb(err, stats.isFile());
      });
    } else cb(null, false);
  });
}

/**
 * element.click(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/click
 */
element.prototype.click = function (cb) {
    return this.browser.clickElement(this, cb);
};

/**
 * element.flick(xoffset, yoffset, speed, cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/touch/flick
 */
element.prototype.flick = function (xoffset, yoffset, speed, cb) {
    return this.browser.flick(this.value, xoffset, yoffset, speed, cb);
};


/**
 * element.text(cb) -> cb(err, text)
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 2
 */
element.prototype.text = function (cb) {
    return this.browser.text(this, cb);
};

/**
 * element.textPresent(searchText, cb) -> cb(err, boolean)
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 4
 */
element.prototype.textPresent = function(searchText, cb) {
    return this.browser.textPresent(searchText, this, cb);
};

/**
 * element.getAttribute(attrName, cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 2
 */
element.prototype.getAttribute = function(name, cb) {
    return this.browser.getAttribute(this, name, cb);
};

/**
 * element.getTagName(cb) -> cb(err, name)
 *
 * @jsonWire GET /session/:sessionId/element/:id/name
 */
element.prototype.getTagName = function(cb) {
    return this.browser.getTagName(this, cb);
};

/**
 * element.isDisplayed(cb) -> cb(err, displayed)
 *
 * @jsonWire GET /session/:sessionId/element/:id/displayed
 */
element.prototype.isDisplayed = function(cb) {
    return this.browser.isDisplayed(this, cb);
};

element.prototype.displayed = element.prototype.isDisplayed;

/**
 * element.isSelected(cb) -> cb(err, selected)
 *
 * @jsonWire GET /session/:sessionId/element/:id/selected
 */
element.prototype.isSelected = function(cb) {
    return this.browser.isSelected(this, cb);
};

element.prototype.selected = element.prototype.isSelected;

/**
  * element.isEnabled(cb) -> cb(err, enabled)
  *
  * @jsonWire GET /session/:sessionId/element/:id/enabled
  */
element.prototype.isEnabled = function(cb) {
    return this.browser.isEnabled(this, cb);
};

element.prototype.enabled = element.prototype.isEnabled;

/**
 * isVisible(cb) -> cb(err, boolean)
 */
element.prototype.isVisible = function(cb) {
    return this.browser.isVisible(this, cb);
};

/**
 * element.getLocation(cb) -> cb(err, location)
 *
 * @jsonWire GET /session/:sessionId/element/:id/location
 */
element.prototype.getLocation = function (cb) {
    return this.browser.getLocation(this, cb);
};

/**
 * element.getSize(cb) -> cb(err, size)
 *
 * @jsonWire GET /session/:sessionId/element/:id/size
 */
element.prototype.getSize = function (cb) {
    return this.browser.getSize(this, cb);
};

/**
 * element.getValue(cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 4
 */
element.prototype.getValue = function(cb) {
    return this.browser.getValue(this, cb);
};

/**
 * element.getComputedCss(cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
element.prototype.getComputedCss = function(styleName, cb) {
    return this.browser.getComputedCss(this, styleName, cb);
};

element.prototype.getComputedCSS = element.prototype.getComputedCss;

/**
 * element.clear(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/clear
 */
element.prototype.clear = function(cb) {
    return this.browser.clear(this, cb);
};

/**
 * element.submit(cb) -> cb(err)
 *
 * @jsonWire POST /session/:sessionId/element/:id/submit
 */
element.prototype.submit = function(cb) {
    return this.browser.submit(this, cb);
};

/**
 * element.getComputedCss(cssProperty , cb) -> cb(err, value)
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
element.prototype.getComputedCss = function(styleName, cb) {
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
  element.prototype['element' + utils.elFuncSuffix(type)] = function(value, cb) {
    element.prototype.element.apply(this, [utils.elFuncFullType(type), value, cb]);
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
  element.prototype['elements' + utils.elFuncSuffix(type)] = function(value, cb) {
    element.prototype.elements.apply(this, [utils.elFuncFullType(type), value, cb]);
  };
});

/**
 * element.element(using, value, cb) -> cb(err, element)
 *
 * @jsonWire POST /session/:sessionId/element/:id/element
 * @docOrder 1
 */
element.prototype.element = function(using, value, cb) {
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
element.prototype.elements = function(using, value, cb) {
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
element.prototype.equals = function(other, cb) {
    return this.browser.equalsElement(this, other, cb);
};

exports.element = element;
