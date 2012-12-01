var webdriver = require('./webdriver');
var Q = require('q');

var promiseWebdriver = module.exports = function() {
    return webdriver.apply(this, arguments);
};

promiseWebdriver.prototype = Object.create(webdriver.prototype);
// copy all the public functions on the webdriver prototype
for (var prop in webdriver.prototype) {
    var fn = webdriver.prototype[prop];
    // ordered per performance on
    // http://jsperf.com/compare-typeof-indexof-hasownproperty
    if (typeof fn === 'function' &&
        prop !== 'chain' &&
        prop.indexOf('_') !== 0 &&
        webdriver.prototype.hasOwnProperty(prop)
    ) {
        promiseWebdriver.prototype[prop] = node(fn);
    }
}

var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
function node(fn) {
    return function() {
        var deferred = Q.defer();

        var args = slice(arguments);
        args.push(deferred.makeNodeResolver());

        fn.apply(this, args);

        return deferred.promise;
    };
}
