function exportFunction(fn) {
  return fn
    .toString()
    .replace(/[\r\n]/g, '')
    .replace(/^function \w+\(\)\s+ \{(.*)\}$/, '$1')
    .trim();
}

function waitForConditionInBrowserJsScript() {
  /* jshint evil:true */
  var args = Array.prototype.slice.call(arguments, 0);
  var condExpr = args[0], timeout = args[1],
      poll = args[2], cb = args[3];
  var waitForConditionImpl = function(conditionExpr, limit, poll, cb) {
    var res;
    if ((new Date().getTime()) < limit) {
      res = eval(conditionExpr);
      if (res === true ) {
        cb(res);
      } else {
        setTimeout(function() {
          waitForConditionImpl(conditionExpr, limit, poll, cb);
        }, poll);
      }
    } else {
      res = eval(conditionExpr);
      return cb(res);
    }
  };
  var limit = (new Date().getTime()) + timeout;
  waitForConditionImpl(condExpr, limit, poll, cb);
}
exports.waitForConditionInBrowserJsScript = exportFunction(waitForConditionInBrowserJsScript);

function safeExecuteJsScript() {
  /* jshint evil:true */
  var args = Array.prototype.slice.call(arguments, 0);
  var code = args[0], fargs = args[1];
  var wrap = function() {
    return eval(code);
  };
  return wrap.apply(this, fargs);
}
exports.safeExecuteJsScript = exportFunction(safeExecuteJsScript);

function safeExecuteAsyncJsScript() {
  /* jshint evil:true */
  var args = Array.prototype.slice.call(arguments, 0);
  var code = args[0], fargs = args[1], done = args[2];
  var wrap = function() {
    return eval(code);
  };
  fargs.push(done);
  wrap.apply(this, fargs);
}
exports.safeExecuteAsyncJsScript = exportFunction(safeExecuteAsyncJsScript);
