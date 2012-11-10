var Args = require("vargs").Constructor;

exports.varargs = function(args) {
  var fargs = new(Args)(args);
  // returning undefined instead of empty callback  
  fargs.callback = fargs.callbackGiven()? fargs.callback : undefined;
  return fargs;
};

