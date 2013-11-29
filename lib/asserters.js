var _ = require('./lodash');

function Asserter(_assert){
  this.assert = _assert;
}

/**
 * asserters.nonEmptyText
 *
 * @asserter
 */
var nonEmptyText = new Asserter(
  function (target, cb) {
    target.text(function(err, text) {
      if(err) { return cb(err); }
      var satisfied = text && _(text).trim().value().length >0;
      cb(null, satisfied, satisfied? text : undefined);
    });
  }
);

/**
 * asserters.textInclude(content) -> Asserter
 *
 * @asserter
 */
function textInclude(content) {
  return new Asserter(
    function(target, cb) {
      target.text(function(err, text) {
        if(err) { return cb(err); }
        var satisfied = text && _(text).includeString(content).value();
        cb(null, satisfied, satisfied? text : undefined);
      });
    }
  );
}

/**
 * asserters.isVisible
 *
 * @asserter
 */
var isVisible = new Asserter(
  function(el,cb) {
    el.isDisplayed(function(err, displayed) {
      if(err) { return cb(err); }
      cb(null, displayed);
    });
  }
);

/**
 * asserters.isHidden
 *
 * @asserter
 */
var isHidden = new Asserter(
  function(el,cb) {
    el.isDisplayed(function(err, displayed) {
      if(err) { return cb(err); }
      cb(null, !displayed);
    });
  }
);

/**
 * asserters.jsCondition(jsConditionExpr) -> Asserter
 * jsConditionExpr: js script expression, should evaluate as boolean.
 *
 * @asserter
 */
function jsCondition(jsConditionExpr, safe) {
  // jshint evil: true
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
