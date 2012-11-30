var main = require('./lib/main');
var promiseWebdriver = require('./lib/promise-webdriver');

exports.remote = function() {
    var driver = main.remote.apply(null, arguments);
    driver.__proto__ = promiseWebdriver.prototype;

    return driver;
};
