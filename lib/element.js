//Element object
//Wrapper around browser methods

var element = function(value, browser) {
    this.browser = browser;
    this.value = value;
};

element.prototype.toString = function () {
    return String(this.value);
};

element.prototype.sendKeys = function (keys, cb) {
    _this = this;
    _this.browser.type(_this, keys, cb);
};

element.prototype.click = function (cb) {
    _this = this;
    _this.browser.clickElement(_this, cb);
};

element.prototype.text = function (cb) {
    _this = this;
    _this.browser.text(_this, cb);
};

element.prototype.textPresent = function(searchText, cb) {
    _this = this;
    _this.browser.textPresent(searchText, _this, cb);
};

element.prototype.getAttribute = function(name, cb) {
    _this = this;
    _this.browser.getAttribute(_this, name, cb);
};

element.prototype.getValue = function(cb) {
    _this = this;
    _this.browser.getValue(_this, cb);
};

element.prototype.clear = function(cb) {
    _this = this;
    _this.browser.clear(_this, cb);
};

exports.element = element;