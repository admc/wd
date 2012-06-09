//Element object
//Wrapper around browser methods

var element = function(value, browser) {
    this.value = value;
};

element.prototype.toString = function () {
    return String(this.value);
};

element.prototype.sendKeys = function (keys, cb) {
    _this = this;
    this.wd.type(this, keys, cb);
};

element.prototype.click = function (cb) {
    _this = this;
    _this.wd.clickElement(_this, cb);
};

element.prototype.text = function (cb) {
    _this = this;
    _this.wd.text(_this, cb);
};

element.prototype.textPresent = function(searchText, cb) {
    _this = this;
    _this.wd.textPresent(searchText, _this, cb);
};

element.prototype.getAttribute = function(name, cb) {
    _this = this;
    _this.wd.getAttribute(_this, name, cb);
};

element.prototype.getValue = function(cb) {
    _this = this;
    _this.wd.getValue(_this, cb);
};

element.prototype.getComputedCSS = function(styleName, cb) {
    _this = this;
    _this.wd.getComputedCSS(_this, styleName, cb);
};

element.prototype.clear = function(cb) {
    _this = this;
    _this.wd.clear(_this, cb);
};

exports.element = element