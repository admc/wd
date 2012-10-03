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

element.prototype.sendKeys = function (keys, cb) {
    this.browser.type(this, keys, cb);
};

element.prototype.click = function (cb) {
    this.browser.clickElement(this, cb);
};

element.prototype.text = function (cb) {
    this.browser.text(this, cb);
};

element.prototype.textPresent = function(searchText, cb) {
    this.browser.textPresent(searchText, this, cb);
};

element.prototype.getAttribute = function(name, cb) {
    this.browser.getAttribute(this, name, cb);
};

element.prototype.getTagName = function(name, cb) {
    this.browser.getTagName(this, name, cb);
};

element.prototype.getValue = function(cb) {
    this.browser.getValue(this, cb);
};

element.prototype.getComputedCSS = function(styleName, cb) {
    this.browser.getComputedCSS(this, styleName, cb);
};

element.prototype.clear = function(cb) {
    this.browser.clear(this, cb);
};

exports.element = element