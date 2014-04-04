// MultiAction object
// Wrapper around touch gestures
var commands = require('./commands');

module.exports = function() {
  var MultiAction = function (element) {
    this.element = element;
    this.actions = [];
  };

  MultiAction.prototype.add = function () {
    for (var i = 0; i < arguments.length; i++) {
      this.actions.push(arguments[i].gestures);
    }
    return this;
  };

  MultiAction.prototype.perform = function () {
    return this.element.performMultiAction(this);
  };

  return MultiAction;
};
