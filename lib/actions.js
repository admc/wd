var _ = require('lodash'),
    __slice = Array.prototype.slice,
    _ = require('lodash'),
    utils = require("./utils");
 
// TouchAction object
// Wrapper around touch gestures

var TouchAction = function () {
  this.gestures = [];
};

var ensureElement = function (gesture, element) {
  if (_(gesture.options.element).isUndefined() || _(gesture.options.element).isNull()) {
    if(element) { gesture.options.element = element.value.toString(); }
    else { throw new Error("No element defined in gesture:" + JSON.stringify(gesture)); }
  }
};

var ensureXY = function (opts) {
  if (_(opts.x).isUndefined()) {
    opts.x = null;
  }
  if (_(opts.y).isUndefined()) {
    opts.y = null;
  }
  if (_(opts.count).isUndefined()) {
    opts.count = null;
  }
};

TouchAction.prototype.applyToElement = function(element) {
  var clone = new TouchAction();
  clone.element = element;
  clone.gestures = _.cloneDeep(this.gestures);
  return clone;
};
TouchAction.prototype.applyTo = TouchAction.prototype.applyToElement;

TouchAction.prototype.pushTouchGesture = function(action, opts, ensureElement) {
  this.gestures.push({
    action: action,
    options: opts,
    ensureElement: ensureElement,
  });
};

TouchAction.prototype._jsonWireGestures = function(element) {
  var _this = this;
  return _.map(this.gestures, function(_gesture) {
    var gesture = {
      action: _gesture.action,
      options: _.cloneDeep(_gesture.options),
    };
    if(_gesture.ensureElement) {
      ensureElement(gesture, _this.element || element);
    }
    return gesture;
  });
};

TouchAction.prototype.performOn = function() {
  var fargs = utils.varargs(arguments),
      browserOrElement = fargs.all[0],
      cb = browserOrElement.isPromised ? undefined : fargs.callback;
  var Element = require('./element');
  var browser, element;
  if(browserOrElement instanceof Element) {
    element = browserOrElement;
    browser = element.browser;
  } else {
    browser = browserOrElement;
  }
  if(browser.isPromised) {
    return browser.performTouch(element, this);
  } else {
    browser.performTouchAction(element, this, cb);
  }
};

TouchAction.prototype.tap = function (opts) {
  opts = opts || {};
  ensureXY(opts);
  this.pushTouchGesture('tap', opts, true);
  return this;
};

TouchAction.prototype.press = function (opts) {
  opts = opts || {};
  ensureXY(opts);
  this.pushTouchGesture('press', opts, true);
  return this;
};

TouchAction.prototype.release = function () {
  this.pushTouchGesture('release', {}, false);
  return this;
};

TouchAction.prototype.moveTo = function (opts) {
  opts = opts || {};
  var ensureElement = false;
  if (_(opts.x).isUndefined() || _(opts.y).isUndefined()) {
    ensureElement = true;
    opts.x = null;
    opts.y = null;
  }
  this.pushTouchGesture('moveTo', opts, ensureElement);
  return this;
};

TouchAction.prototype.longPress = function (opts) {
  opts = opts || {};
  ensureXY(opts);
  this.pushTouchGesture('longPress', opts, true);
  return this;
};

TouchAction.prototype.wait = function (opts) {
  opts = opts || {};
  if (_(opts).isNumber()) { opts = { ms: opts }; }
  opts = opts || {};
  if (_(opts.ms).isUndefined() || _(opts.ms).isNull()) {
    opts.ms = 0;
  }
  this.pushTouchGesture('wait', opts, true);
  return this;
};

// we need to figure out what this actually is supposed to do
TouchAction.prototype.cancel = function () {
  return this;
};

// MultiAction object
// Wrapper around touch gestures

var MultiAction = function () {
  this.actions = [];
};

MultiAction.prototype.applyToElement = function(element) {
  var clone = new MultiAction();
  clone.element = element;
  clone.actions = _.map(this.actions, function(action) {
    if(action.element) { return action; }
    else { return action.applyToElement(element); }
  });
  return clone;
};

MultiAction.prototype.applyTo = MultiAction.prototype.applyToElement;

MultiAction.prototype._jsonWireGestures = function(element) {
  return _.map(this.actions, function(action) {
    return action._jsonWireGestures(element);
  });
};

MultiAction.prototype.add = function () {
  var actions = __slice.call(arguments, 0);
  _(actions).each(function(action) {
    this.actions.push(action);
  }, this);
  return this;
};

MultiAction.prototype.performOn = function() {
  var fargs = utils.varargs(arguments),
      browserOrElement = fargs.all[0],
      cb = browserOrElement.isPromised ? undefined : fargs.callback;
  var Element = require('./element');
  var browser, element;
  if(browserOrElement instanceof Element) {
    element = browserOrElement;
    browser = element.browser;
  } else {
    browser = browserOrElement;
  }
  if(browser.isPromised) {
    return browser.performMultiTouch(element, this);
  } else {
    browser.performMultiTouch(element, this, cb);
  }
};

module.exports = {
  TouchAction: TouchAction,
  MultiAction: MultiAction
};
