// TouchAction object
// Wrapper around touch gestures
var commands = require('./commands');

module.exports = function() {
  var TouchAction = function (element) {
    this.element = element;
    this.gestures = [];
  };

  var ensureElement = function (opts, element) {
    if (typeof opts.element === "undefined" || opts.element === null) {
      opts.element = element.value.toString();
    }
  };

  var ensureXY = function (opts) {
    if (typeof opts.x === "undefined") {
      opts.x = null;
    }
    if (typeof opts.y === "undefined") {
      opts.y = null;
    }
    if (typeof opts.count === "undefined") {
      opts.count = null;
    }
  };

  TouchAction.prototype.tap = function (opts) {
    if (typeof opts === 'undefined') {
      opts = {};
    }

    ensureElement(opts, this.element);
    ensureXY(opts);

    this.pushTouchGesture('tap', opts);

    return this;
  };

  TouchAction.prototype.press = function (opts) {
    if (typeof opts === 'undefined') {
      opts = {};
    }

    ensureElement(opts, this.element);
    ensureXY(opts);

    this.pushTouchGesture('press', opts);

    return this;
  };

  TouchAction.prototype.release = function () {
    this.pushTouchGesture('release', { });

    return this;
  };

  TouchAction.prototype.moveTo = function (opts) {
    if (typeof opts === 'undefined') {
      opts = {};
    }

    if (typeof opts.x === "undefined" || typeof opts.y === "undefined") {
      ensureElement(opts, this.element);
      opts.x = null;
      opts.y = null;
    }

    this.pushTouchGesture('moveTo', opts);

    return this;
  };

  TouchAction.prototype.longPress = function (opts) {
    if (typeof opts === 'undefined') {
      opts = {};
    }

    ensureElement(opts, this.element);
    ensureXY(opts);

    this.pushTouchGesture('longPress', opts);

    return this;
  };

  TouchAction.prototype.wait = function (opts) {
    if (typeof opts === 'number') {
      opts = {
        ms: opts
      };
    } else if (typeof opts === 'undefined') {
      opts = {};
    }

    ensureElement(opts, this.element);
    if (typeof opts.ms === 'undefined' || opts.ms === null) {
      opts.ms = 0;
    }

    this.pushTouchGesture('wait', opts);

    return this;
  };

  // we need to figure out what this actually is supposed to do
  TouchAction.prototype.cancel = function () {
    return this;
  };

  TouchAction.prototype.pushTouchGesture = function(action, opts) {
    if (typeof this.gestures === "undefined" || !this.gestures) {
      this.gestures = [];
    }
    this.gestures.push({
      action: action,
      options: opts
    });
  };

  TouchAction.prototype.perform = function () {
    return this.element.performTouchAction(this);
  };

  return TouchAction;
};
