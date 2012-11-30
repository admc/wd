//Element object
//Wrapper around browser methods

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
 * @return {Promise}
 *
 * @jsonWire POST /session/:sessionId/element/:id/value
 */
element.prototype.type = function (keys, cb) {
    return this.browser.type(this, keys, cb);
};

element.prototype.sendKeys = element.prototype.type;


/**
 * element.click(cb) -> cb(err)
 * @return {Promise}
 *
 * @jsonWire POST /session/:sessionId/element/:id/click
 */
element.prototype.click = function (cb) {
    return this.browser.clickElement(this, cb);
};

/**
 * element.text(cb) -> cb(err, text)
 * @return {Promise<string>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 2
 */
element.prototype.text = function (cb) {
    return this.browser.text(this, cb);
};

/**
 * element.textPresent(searchText, cb) -> cb(err, boolean)
 * @return {Promise<boolean>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/text
 * @docOrder 4
 */
element.prototype.textPresent = function(searchText, cb) {
    return this.browser.textPresent(searchText, this, cb);
};

/**
 * element.getAttribute(attrName, cb) -> cb(err, value)
 * @return {Promise<string>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 2
 */
element.prototype.getAttribute = function(name, cb) {
    return this.browser.getAttribute(this, name, cb);
};

/**
 * element.getTagName(cb) -> cb(err, name)
 * @return {Promise<string>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/name
 */
element.prototype.getTagName = function(cb) {
    return this.browser.getTagName(this, cb);
};

/**
 * element.isDisplayed(cb) -> cb(err, displayed)
 * @return {Promise<boolean>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/displayed
 */
element.prototype.isDisplayed = function(cb) {
    return this.browser.isDisplayed(this, cb);
};

element.prototype.displayed = element.prototype.isDisplayed;

/**
 * isVisible(cb) -> cb(err, boolean)
 * @return {Promise<boolean>}
 */
element.prototype.isVisible = function(cb) {
    return this.browser.isVisible(this, cb);
};

/**
 * element.getValue(cb) -> cb(err, value)
 * @return {Promise<string>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/attribute/:name
 * @docOrder 4
 */
element.prototype.getValue = function(cb) {
    return this.browser.getValue(this, cb);
};

/**
 * element.getComputedCss(cssProperty , cb) -> cb(err, value)
 * @return {Promise<string>}
 *
 * @jsonWire GET /session/:sessionId/element/:id/css/:propertyName
 */
element.prototype.getComputedCss = function(styleName, cb) {
    return this.browser.getComputedCss(this, styleName, cb);
};

element.prototype.getComputedCSS = element.prototype.getComputedCss;

/**
 * element.clear(cb) -> cb(err)
 * @return {Promise}
 *
 * @jsonWire POST /session/:sessionId/element/:id/clear
 */
element.prototype.clear = function(cb) {
    return this.browser.clear(this, cb);
};

exports.element = element;
