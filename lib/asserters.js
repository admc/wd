var S = require('string');

function Asserter(_assert){
  this.assert = _assert;
}

// todo: update doc tool to autodocument those

var nonEmptyText = new Asserter(
  function (target, cb) {
    target.text(function(err, text) {
      if(err) { return cb(err); }
      var satisfied = text && S(text).trim().length >0;
      cb(null, satisfied, satisfied? text : undefined);
    });
  }
);

function textInclude(content) {
  return new Asserter(
    function(target, cb) {
      target.text(function(err, text) {
        if(err) { return cb(err); }
        var satisfied = text && S(text).contains(content);
        cb(null, satisfied, satisfied? text : undefined);
      });
    }
  );
}

var isVisible = new Asserter(
  function(el,cb) {
    el.isVisible(function(err, isVisible) {
      if(err) { return cb(err); }
      cb(null, isVisible);
    });
  }
);

var isHidden = new Asserter(
  function(el,cb) {
    el.isVisible(function(err, isVisible) {
      if(err) { return cb(err); }
      cb(null, !isVisible);
    });
  }
);

function jsCondition(jsConditionExpr, safe) {
  /* jshint evil: true */
  if(safe === undefined) { safe = false; }
  return new Asserter(
    function(browser, cb) {
      var _eval = safe? browser.safeEval : browser.eval;
      _eval.apply( browser , [jsConditionExpr, function(err, res) {
        if(err) {return cb(err);}
        cb(null, res, res);
      }]);
    }
  );
}

module.exports = {
  Asserter: Asserter,
  nonEmptyText: nonEmptyText,
  isVisible: isVisible,
  isHidden: isHidden,
  textInclude: textInclude,
  jsCondition: jsCondition
};
