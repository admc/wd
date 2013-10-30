var __slice = Array.prototype.slice
, Q = require('q')
, _ = require('lodash')
, EventEmitter = require('events').EventEmitter
, slice = Array.prototype.slice.call.bind(Array.prototype.slice);

// The method below returns no result, so we are able hijack the result to
// preserve the element scope.
// This alows for thing like: field.click().clear().input('hello').getValue()
var elementChainableMethods = ['clear','click','doubleClick','doubleclick',
  'flick','sendKeys','submit','type','keys','moveTo'];

// gets the list of methods to be promisified.
function filterPromisedMethods(Obj) {
  return _(Obj).functions().filter(function(fname) {
    return  !fname.match('^chain$|^toString$|^_') &&
            !EventEmitter.prototype[fname];
  }).value();
}

// promise detection
function isPromise(x) {
  return (typeof x === "object" || typeof x === "function") && x !== null && typeof x.then === "function";
}

// enriches a promise with the browser + element methods.
function enrich(obj, browser){
  // There are cases were enrich may be called on non-promise objects.
  // It is easier and safer to check within the method.
  if(isPromise(obj) && !obj.__wd_promise_enriched) {
    var promise = obj;

    // __wd_promise_enriched is there to avoid enriching twice.
    promise.__wd_promise_enriched = true;

    // making sure all the sub-promises are also enriched.
    _(promise).functions().each(function(fname) {
      var _orig = promise[fname];
      promise[fname] = function() {
        return enrich(
          _orig.apply(this, __slice.call(arguments, 0))
          , browser);
      };
    });

    // we get the list of methods first cause we need it in the enrich method.
    var browserProto = Object.getPrototypeOf(browser);
    var Element = browserProto._Element;

    // we get the list of methods first cause we need it in the enrich method.
    var promisedMethods = filterPromisedMethods(browserProto);
    var elementPromisedMethods =
      Element? filterPromisedMethods(Element.prototype) : [];
    var allPromisedMethods = _.union(promisedMethods,
      filterPromisedMethods(browserProto), elementPromisedMethods);

    // adding browser + element methods to the current promise.
    _(allPromisedMethods).each(function(fname) {
      promise[fname] = function() {
        var args = __slice.call(arguments, 0);
        // This is a hint to figure out if we need to call a browser method or
        // an element method.
        // "<" --> browser method
        // ">" --> element method
        var scopeHint;
        if(args && args[0] && typeof args[0] === 'string' && args[0].match(/^<$|^>$/)) {
          scopeHint = args[0];
          args = _.rest(args);
        }

        return this.then(function(res) {
          var el;
          // if the result is an element it has priority
          if(Element && res instanceof Element) {el=res;}

          // testing the water for the next call scope
          var isBrowserMethod =
            _.indexOf(promisedMethods, fname) >= 0;
          var isElementMethod =
            el && _.indexOf(elementPromisedMethods, fname) >= 0;

          if(!isBrowserMethod && !isElementMethod) {
            // doesn't look good
            throw new Error("Invalid method " + fname);
          }

          if(isBrowserMethod && isElementMethod){
            // we need to resolve the conflict.
            if(scopeHint === '<' ){
              isElementMethod = false;
            } else if(scopeHint === '>' ){
              isBrowserMethod = false;
            } else if(fname.match(/element/) || (Element && args[0] instanceof Element)) {
              // method with element locators are browser scoped by default.
              // When an element is passed, we are also obviously in the global scope.
              isElementMethod = false;
            } else {
              // otherwise we stay in the element scope to allow sequential calls
              isBrowserMethod = false;
            }
          }

          if(isElementMethod){
            // element method case.
            return el[fname].apply(el, args).then(function(res) {
              if( _.indexOf(elementChainableMethods, fname) >= 0) {
                // method like click, where no result is expected, we return
                // the element to make it chainable
                return el;
              } else {
                return res; // we have no choice but loosing the scope
              }
            });
          }else{
            // browser case.
            return browser[fname].apply(browser, args);
          }
        });
      };
    });
    // transfering _enrich
    promise._enrich = function(target) {
      return browser._enrich(target);
    };

    // adding print error helper
    promise.printError = function() {
      return promise.catch(function(err) {
        console.log(err);
        throw err;
      });
    };
  }
  return obj;
}

module.exports = function(WebDriver, chainable) {

  // wraps element + browser call in an enriched promise.
  // This is the same as in the first promise version, but enrichment +
  // event logging were added.
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
      if (typeof args[args.length - 1] === 'function' &&
        !fname.match('Mock')) // This is for the mocking method of wd-tractor
                              // which are the only cases of sync call with
                              // function parameters.
                              // Should find a better way if more cases arise
      {
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

      if(chainable){
        return enrich(deferred.promise, this);
      } else {
        return deferred.promise;
      }
    };
  }

  var Element = WebDriver.prototype._Element;

  // promisify element shortcuts too
  var promiseElement = function() {
    return Element.apply(this, arguments);
  };

  // Element replacement.
  promiseElement.prototype = Object.create(Element.prototype);

  // WebDriver replacement.
  var promiseWebdriver = function() {
    var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return WebDriver.apply(this, args);
  };

  promiseWebdriver.prototype = Object.create(WebDriver.prototype);

  promiseWebdriver.prototype._Element = promiseElement;

  // wrapping browser methods with promises.
  _(filterPromisedMethods(WebDriver.prototype)).each(function(fname) {
    promiseWebdriver.prototype[fname] = wrap(WebDriver.prototype[fname], fname );
  });

  // wrapping element methods with promises.
  _(filterPromisedMethods(Element.prototype)).each(function(fname) {
    promiseElement.prototype[fname] = wrap(Element.prototype[fname], fname );
  });

  // used to by chai-as-promised
  promiseWebdriver.prototype._enrich = function(target){
    if(chainable) { enrich(target, this); }
  };

  promiseElement.prototype._enrich = function(target){
    if(chainable) { enrich(target, this.browser); }
  };

  // helper to allow easier promise debugging.
  promiseWebdriver.prototype._debugPromise = function() {
    this.on('promise', function(context, method, args, status) {
      args = _.clone(args);
      if(context instanceof promiseWebdriver) {
        context = '';
      } else {
        context = ' [element ' + context.value + ']';
      }
      if(typeof _.last(args) === 'function') {
        args.pop();
      }
      args = ' ( ' + _(args).map(function(arg) {
        if(arg instanceof Element) {
          return arg.toString();
        } else if(typeof arg === 'object') {
          return JSON.stringify(arg);
        } else {
          return arg;
        }
      }).join(', ') + ' )';
      console.log(' --> ' + status + context + " " + method + args   );
    });
  };

  return promiseWebdriver;
};
