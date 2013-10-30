var Args = require("vargs").Constructor;
var _ = require('lodash');

var varargs = exports.varargs = function(args) {
  var fargs = new(Args)(args);
  // returning undefined instead of empty callback
  fargs.callback = fargs.callbackGiven()? fargs.callback : undefined;
  return fargs;
};

// small helper to make sure we don't loose exceptions
// use this instead of looking  the last argument manually
exports.findCallback = function(_arguments){
  var fargs = varargs(_arguments);
  return fargs.callback;
};

// convert to type to something like ById, ByCssSelector, etc...
exports.elFuncSuffix = function(type){
  var res = (' by ' + type).replace(/(\s[a-z])/g,
    function($1){return $1.toUpperCase().replace(' ','');});
  return res.replace('Xpath', 'XPath');
};

// return correct jsonwire type
exports.elFuncFullType = function(type){
  if(type === 'css') {return 'css selector'; } // shortcut for css
  return type;
};

// from JsonWire spec + shortcuts
exports.elementFuncTypes = ['class name', 'css selector','id','name','link text',
  'partial link text','tag name', 'xpath', 'css' ];

// chai-as-promised promisifier
// just adding the core method for the sake of safety.\
// if you need more than that, build your custom promisifier
var Q_CORE_METHODS = [
    // core methods:
     "then", "catch", "fail", "progress", "finally", "fin", "done"
];

exports.transferPromiseness = function(target, promise) {
  _(Q_CORE_METHODS).each(function(methodName) {
    if (promise[methodName]) {
      target[methodName] = promise[methodName].bind(promise);
    }
  });
  if(promise._enrich) {
    promise._enrich(target);
  }
};
