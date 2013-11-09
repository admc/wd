var S = require('string');

// todo: update doc tool to autodocument those

function nonEmptyText(target, cb) {
  target.text(function(err, text) {
    if(err) { return cb(err); }
    var satisfied = text && S(text).trim().length >0;
    cb(null, satisfied, satisfied? text : undefined);
  });
}

function textInclude(content) {
  return function(target, cb) {
    target.text(function(err, text) {
      if(err) { return cb(err); }
      var satisfied = text && S(text).contains(content);
      cb(null, satisfied, satisfied? text : undefined);
    });
  };
}

function isVisible(el,cb) {
  el.isVisible(function(err, isVisible) {
    if(err) { return cb(err); }
    cb(null, isVisible);
  });
}

function isHidden(el,cb) {
  el.isVisible(function(err, isVisible) {
    if(err) { return cb(err); }
    cb(null, !isVisible);
  });
}

module.exports = {
  nonEmptyText: nonEmptyText,
  isVisible: isVisible,
  isHidden: isHidden,
  textInclude: textInclude
};
