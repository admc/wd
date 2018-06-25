//ImageElement object
//Wrapper around tap methods
var __slice = Array.prototype.slice;

var ImageElement = function(rect, browser) {
  this.rect = rect;
  this.browser = browser;
  this.x = Math.floor(rect.x + rect.width / 2);
  this.y = Math.floor(rect.y + rect.height / 2);

  if(!rect){
    throw new Error("no rect passed to Element constructor");
  }

  if(!browser){
    throw new Error("no browser passed to Element constructor");
  }
};

ImageElement.prototype.emit = function() {
  this.browser.emit.apply(this.browser, __slice.call(arguments, 0));
};

ImageElement.prototype.toString = function () {
  return "ImageElement: " + JSON.stringify(this.toJSON());
};

ImageElement.prototype.toJSON = function () {
  return this.rect;
};

Object.defineProperty(ImageElement, 'TouchAction', {
  // only want to load the TouchAction class once, and only after all files
  // are loaded, so as to avoid circularity in the module loading
  get: function () {
    if (!this._touchAction) {
      this._touchAction = require('./actions').TouchAction;
    }
    return this._touchAction;
  }
});

ImageElement.prototype.click = function (cb) {
  var _this = this;
  this.emit('command', "CALL" , "imageElement.click()")
  var action = new this.TouchAction(this.browser);
  action.tap(this.x, this.y);
  action.perform(function(err) {
    if(err) {
      err.message = '[imageElement.click()] ' + err.message;
      cb(err);
    } else {
      _this.emit('command', "RESPONSE" , "imageElement.click()");
      cb();
    }
  });
};

module.exports = ImageElement;
