var __slice = Array.prototype.slice;
var webdriver = require('./webdriver')
, Q = require('q')
, _ = require('lodash')
, EventEmitter = require('events').EventEmitter
, element = require('./element').element
, slice = Array.prototype.slice.call.bind(Array.prototype.slice);


function filterPromisedMethods(Obj){
  return _(Obj.prototype).functions().filter(function(fname) {
    return  !fname.match('^chain$|^toString$|^_') &&
            !EventEmitter.prototype[fname];
  }).value();
}

var promisedMethods = filterPromisedMethods(webdriver);
var elementPromisedMethods = filterPromisedMethods(element);
var allPromisedMethods = _.union(promisedMethods, allPromisedMethods);

function enrich(obj, browser){
  if(obj instanceof Q.makePromise && !obj.__wd_promise_enriched) {
    var promise = obj;
    promise.__wd_promise_enriched = true;
    _(promise).functions().each(function(fname) {
      var _orig = promise[fname];
      promise[fname] = function() {
        return enrich(
          _orig.apply(this, __slice.call(arguments, 0))
          , browser);
      };
    });


    _(allPromisedMethods).each(function(fname) {
      promise[fname] = function() {
        var args = __slice.call(arguments, 0);
        return this.then(function(res) {
          if(res instanceof element && _.indexOf(elementPromisedMethods, fname) >= 0 ){
            return res[fname].apply(res, args);
          }else{
            return browser[fname].apply(browser, args);
          }
        });
      };
    });
  }
  return obj;
}

function wrap(fn, fname) {
  return function() {
    var _this = this;
    var callback;
    var args = slice(arguments);
    var deferred = Q.defer();
    deferred.promise.then(function() {
      _this.emit("promise", _this, fname , args , "finished" );
    });


    // Remove any undefined values from the end of the arguments array
    // as these interfere with our callback detection below
    for (var i = args.length - 1; i >= 0 && args[i] === undefined; i--) {
      args.pop();
    }

    // If the last argument is a function assume that it's a callback
    // (Based on the API as of 2012/12/1 this assumption is always correct)
    if (typeof args[args.length - 1] === 'function') {
      // Remove to replace it with our callback and then call it
      // appropriately when the promise is resolved or rejected
      callback = args.pop();
      deferred.promise.then(function(value) {
        callback(null, value);
      }, function(error) {
        callback(error);
      });
    }

    args.push(deferred.makeNodeResolver());
    _this.emit("promise", _this, fname , args , "calling" );
    fn.apply(this, args);

    return enrich(deferred.promise, this);
  };
}

// promisify element shortcuts too
var promiseElement = function() {
  return element.apply(this, arguments);
};

promiseElement.prototype = Object.create(element.prototype);

var promiseWebdriver = module.exports = function() {
  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  // inject promisified element
  args.push(promiseElement);
  // making q available to the browser
  this.Q = Q;

  return webdriver.apply(this, args);
};

promiseWebdriver.prototype = Object.create(webdriver.prototype);

_(promisedMethods).each(function(fname) {
  promiseWebdriver.prototype[fname] = wrap(webdriver.prototype[fname], fname );
});

_(elementPromisedMethods).each(function(fname) {
  promiseElement.prototype[fname] = wrap(element.prototype[fname], fname );
});

// shows promise call
promiseWebdriver.prototype._debugPromise = function() {
  this.on('promise', function(context, method, args, status) {
    if(context instanceof promiseWebdriver) {
      context = '';
    } else {
      context = ' [element ' + context.value + ']';
    }
    args = ' ( ' + _.initial(args).map(function(arg) {return arg.toString();}).join(', ') + ' )';
    console.log(' --> ' + status + context + " " + method + args   );
  });
};
