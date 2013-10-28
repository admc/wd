var Args = require("vargs").Constructor;

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

// chai-as-promised promisify method
exports.buildPromisify = function(PromiseChainWebdriver) {

  var Q_METHODS = [
      "then", "catch", "fail", "progress", "finally", "fin", "done",
      "get", "set", "delete", "del", "post", "mapply", "invoke", "send",
      "fbind", "fapply", "fcall",
      "all", "allSettled", "spread",
      "thenResolve", "thenReject", "timeout", "delay",
      "isFulfilled", "isRejected", "isPending", "inspect",
      "nodeify",
      "dispatch"
      // colliding methods: "keys",
  ];

  return function(that, derivedPromise) {
    (function() {
      for (var i in Q_METHODS) {
        var property = Q_METHODS[i];
        if (derivedPromise[property]) {
          that[property] = derivedPromise[property].bind(derivedPromise);
        }
      }
      if (derivedPromise.keys) {
          that.qKeys = derivedPromise.keys.bind(derivedPromise);
      }
    })();
    (function() {
      for (var i in PromiseChainWebdriver.promisedChainMethods) {
        var property = PromiseChainWebdriver.promisedChainMethods[i];
        if (derivedPromise[property]) {
          that[property] = derivedPromise[property].bind(derivedPromise);
        }
      }
    })();
  };
};
