# WD.js

**node.js Webdriver/Selenium 2 client**

- [Site](http://admc.io/wd/)
- [Mailing List](https://groups.google.com/forum/#!forum/wdjs)

[![Build Status](https://secure.travis-ci.org/admc/wd.png?branch=master)](http://travis-ci.org/admc/wd)
[![Selenium Test Status](https://saucelabs.com/buildstatus/wdjs)](https://saucelabs.com/u/wdjs)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/wdjs.svg)](https://saucelabs.com/u/wdjs)

## Install

```
npm install wd
```

## Authors

  - Adam Christian ([admc](http://github.com/admc))
  - Ruben Daniels ([javruben](https://github.com/javruben))
  - Peter Braden ([peterbraden](https://github.com/peterbraden))
  - Seb Vincent ([sebv](https://github.com/sebv))
  - Peter 'Pita' Martischka ([pita](https://github.com/Pita))
  - Jonathan Lipps ([jlipps](https://github.com/jlipps))
  - Phil Sarin ([pdsarin](https://github.com/pdsarin))
  - Mathieu Sabourin ([OniOni](https://github.com/OniOni))
  - Bjorn Tipling ([btipling](https://github.com/btipling))
  - Santiago Suarez Ordonez ([santiycr](https://github.com/santiycr))
  - Bernard Kobos ([bernii](https://github.com/bernii))
  - Jason Carr ([maudineormsby](https://github.com/maudineormsby))
  - Matti Schneider ([MattiSG](https://github.com/MattiSG))

## License

  * License - Apache 2: http://www.apache.org/licenses/LICENSE-2.0

## Release notes

Latest version is `0.2.6`.

Many changes have been introduced in 0.2.x versions, please check
[here](https://github.com/admc/wd/blob/master/doc/release-notes.md) for more details.

### caveats when upgrading to 0.2.3
  - Most wait methods have been deprecated replaced by waitFor/waitForElement + asserters. See doc below, don't hesitate to add more asserters if you feel it is useful for others.
  - Manual monkey patching is not recommended anymore, there were some side use cases which were not easy to cover.
  Use addAsyncMethod/addPromiseMethod/addPromiseChainMethod methods instead. See doc below.

## Usage

### Q promises + chaining

```js
...

browser
  .init({browserName:'chrome'})
  .get("http://admc.io/wd/test-pages/guinea-pig.html")
  .title()
    .should.become('WD Tests')
  .elementById('i am a link')
  .click()
  .eval("window.location.href")
    .should.eventually.include('guinea-pig2')
  .back()
  .elementByCss('#comments').type('Bonjour!')
  .getValue().should.become('Bonjour!')
  .fin(function() { return browser.quit(); })
  .done();
```
[full code here](https://github.com/admc/wd/blob/master/examples/promise/chrome.js)


### Pure async

```js
...

browser.init({browserName:'chrome'}, function() {
  browser.get("http://admc.io/wd/test-pages/guinea-pig.html", function() {
    browser.title(function(err, title) {
      title.should.include('WD');
      browser.elementById('i am a link', function(err, el) {
        browser.clickElement(el, function() {
          /* jshint evil: true */
          browser.eval("window.location.href", function(err, href) {
            href.should.include('guinea-pig2');
            browser.quit();
          });
        });
      });
    });
  });
});
```
[full code here](https://github.com/admc/wd/blob/master/examples/async/chrome.js)


### Q promises without chaining

See example [here](https://github.com/admc/wd/blob/master/examples/promise/no-chain.js).

## Generators api

### Yiewd

[Yiewd](https://github.com/jlipps/yiewd) is a wrapper around Wd.js that uses
generators in order to avoid nested callbacks, like so:

```js
wd.remote(function*() {
  yield this.init(desiredCaps);
  yield this.get("http://mysite.com");
  el = yield this.elementById("someId");
  yield el.click();
  el2 = yield this.elementById("anotherThing")
  text = yield el2.text();
  text.should.equal("What the text should be");
  yield this.quit();
});
```
## Mocha integration

```js
...

describe("using mocha-as-promised and chai-as-promised", function() {
  var browser;

  before(function() {
    browser = wd.promiseChainRemote();
    ...

    return browser.init({browserName:'chrome'});
  });

  beforeEach(function() {
    return browser.get("http://admc.io/wd/test-pages/guinea-pig.html");
  });

  after(function() {
    return browser.quit();
  });

  it("should retrieve the page title", function() {
    return browser.title().should.become("WD Tests");
  });

  it("submit element should be clicked", function() {
    return browser.elementById("submit").click().eval("window.location.href")
      .should.eventually.include("&submit");
  });
});
```

[example here](https://github.com/admc/wd/blob/master/examples/promise/mocha-specs.js)


## Repl

```
./node_modules/.bin/wd shell
```

```
): wd shell
> x = wd.remote() or wd.remote("ondemand.saucelabs.com", 80, "username", "apikey")

> x.init() or x.init({desired capabilities override})
> x.get("http://www.url.com")
> x.eval("window.location.href", function(e, o) { console.log(o) })
> x.quit()
```

## Doc

### Api

[jsonwire mapping + api doc](https://github.com/admc/wd/blob/master/doc/api.md)

[full jsonwire mapping](https://github.com/admc/wd/blob/master/doc/jsonwire-full-mapping.md)

### JsonWireProtocol

WD is simply implementing the Selenium JsonWireProtocol, for more details see the official docs:
 - <a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol">http://code.google.com/p/selenium/wiki/JsonWireProtocol</a>

### Browser initialization

#### Indexed parameters

```js
var browser = wd.remote();
// or
var browser = wd.remote('localhost');
// or
var browser = wd.remote('localhost', 8888);
// or
var browser = wd.remote("ondemand.saucelabs.com", 80, "username", "apikey");
```
#### Named parameters

The parameters used are similar to those in the [url](http://nodejs.org/docs/latest/api/url.html) module.

```js
var browser = wd.remote()
// or
var browser = wd.remote({
  hostname: '127.0.0.1',
  port: 4444,
  user: 'username',
  pwd: 'password',
});
// or
var browser = wd.remote({
  hostname: '127.0.0.1',
  port: 4444,
  auth: 'username:password',
});
```

The following parameters may also be used (as in earlier versions):

```js
var browser = wd.remote({
  host: '127.0.0.1',
  port: 4444,
  username: 'username',
  accessKey: 'password',
});
```
#### Url string

```js
var browser = wd.remote('http://localhost:4444/wd/hub');
// or
var browser = wd.remote('http://user:apiKey@ondemand.saucelabs.com/wd/hub');
```

#### Url object created via url.parse

[URL module documentation](http://nodejs.org/docs/v0.10.0/api/url.html#url_url)

```js
var url = require('url');
var browser = wd.remote(url.parse('http://localhost:4444/wd/hub'));
// or
var browser = wd.remote(url.parse('http://user:apiKey@ondemand.saucelabs.com:80/wd/hub'));
```

#### Defaults

```js
{
    protocol: 'http:'
    hostname: '127.0.0.1',
    port: '4444'
    path: '/wd/hub'
}
```

#### Connect to an already-existing session

Instead of calling 'init' use 'attach' using the WebDriver session ID:

```js
var browser = wd.remote('http://localhost:4444/wd/hub');
browser.attach('df606fdd-f4b7-4651-aaba-fe37a39c86e3', function(err, capabilities) {
  // The 'capabilities' object as returned by sessionCapabilities
  if (err) { /* that session doesn't exist */ }
  else {
    browser.elementByCss("button.groovy-button", function(err, el) {
      ...
    });
  }
});
```

### Capabilities

[doc here](https://code.google.com/p/selenium/wiki/DesiredCapabilities).

### Element function chaining (using promise chains)

With the promise chain api the method from the `browser` prototype and the
`element` prototype are all available within the `browser` instance, so it might
be confusing at first. However we tried to keep the logic as simple as possible
using the principles below:

- There is no state passed between calls, except for what the method returns.
- If the method returns an element the element scope is propagated.
- If the method returns nothing (click, type etc...) we make the method return the current element, so the element scope is propagated.
- If the method returns something (text, getAttribute...), the element scope is lost.
- You may use "<" as the first parameter to get out of the element scope.
- You may use ">" as the first parameter to force the call to be done within the current context (mainly used to retrieve subelements).

If you need to do something more complicated, like reusing an element for 2 calls, then
can either Q promise functionnality (like then, Q.all or Q sequences), or retrieve your
element twice (since the promise chain api is very terse, this is usually acceptable).

Element function chaining example [here](https://github.com/admc/wd/blob/master/examples/promise/chained-el-func-call.js)

### Waiting for something

Below are the methods to use to wait for a condition:

- `browser.waitFor(asserter, timeout, pollFreq, cb) -> cb(err, value)`: generic wait method, the return value is provided by the asserter when the condition is satisfied.
- `browser.waitForElementBy???(value ,asserter, timeout, pollFreq, cb) -> cb(err, el)`: waits for a element then a
condition, then returns the element.
- `browser.waitForConditionInBrowser(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)`: waits for a js condition within a browser, then returns a boolean.

Asserters should be written using either models below . `target` may be `browser` and/or `element` depending on the context.

```js
// async
var asyncAsserter = new Asserter(
  function(target,cb) {
    ...
    cb(err, satisfied, value);
  }
);

// promise
var promiseAsserter = new Asserter(
  function(target) {
    ...
    return promise; // promise resolved with the wait_for return value.

    // Promise asserter should throw errors marked with `err.retriable=true`
    // when the condition is not satisfied.
  }
);

```

Example [here](https://github.com/admc/wd/blob/master/examples/promise/wait-for.js).

There are ready to use asserters [here](https://github.com/admc/wd/blob/master/lib/asserters.js),
See also the asserter category in the api doc [here](https://github.com/admc/wd/blob/master/doc/api.md).

### Adding custom methods

- `wd.addAsyncMethod(name, method)`: This is for regular async methods with callback as the last argument. This will not only add the method to the async browser prototype, but also wrap the method and add it to the promise and promiseChain prototypes.
- `wd.addPromiseMethod(name, method)`: This is for promise returning methods NOT USING CHAIN internally. This will not only add the method to the promise browser prototype, but also wrap the method and add it to the promiseChain prototype (but not to the async prototype).
- `wd.addPromiseChainMethod(name, method)`: This is for promise returning methods USING CHAIN internally. This will only add the method to the promiseChain browser prototype (but neither to async nor to promise browser prototypes).

If you are only using the promise chain api, you should probably stick with `wd.addPromiseChainMethod`.

Custom methods may be removed with `wd.removeMethod(name)`. That will remove the method from the 3 prototypes.

Please refer to the following examples:

- [promise chain](https://github.com/admc/wd/blob/master/examples/promise/add-method.js).
- [async method used by promise chain](https://github.com/admc/wd/blob/master/examples/promise/add-method-async.js).
- [promise no-chain](https://github.com/admc/wd/blob/master/examples/promise/add-method-no-chain.js).
- [async](https://github.com/admc/wd/blob/master/examples/async/add-method.js).

Note: No need to call rewrap anymore.

### Promise helpers

This is an alternative to adding custom methods.
See example [here](https://github.com/admc/wd/blob/master/examples/promise/helper.js).

### Starting the promise chain

The `browser` and `element` object are not themselves promises (cause that would lead to chaos), so you
cannot call Q core methods on them. However you may call one of the method below to initiate the promise
chain:

- `browser.chain()`
- `browser.noop()`
- `browser.resolve(promise)`
- `element.chain()`
- `element.noop()`
- `element.resolve(promise)`

The `resolve` methods work like `Q` `thenResolve`.

### Working with external promise libraries

`wd` uses `Q` internally, but you may use promises from other libraries with the following methods:

- `browser.resolve(externalPromise)`
- `wd.addPromiseChainMethod(name, externalPromise)`
- `wd.addPromiseMethod(name, externalPromise)`

The external promise will be automatically wrapped within a Q promise using `new Q(externalPromise)`.

See example [here](https://github.com/admc/wd/blob/master/examples/promise/external-promise.js).

### Http configuration / base url

Http behaviour and base url may be configured via the `configureHttp` method as
in the code below:

```js
// global config
wd.configureHttp({
  timeout: 60000,
  retries: 3,
  retryDelay: 100,
  baseUrl = 'http://example.com/'
});
// per browser config
browser.configureHttp({
  timeout: 60000,
  retries: 3,
  retryDelay: 100,
  baseUrl = 'http://example.com/'
});
```

- timeout: http timeout in ms, default is `undefined` (uses the server timeout,
  usually 60 seconds). Use `'default'` or `undefined` for server default.
- retries: Number of reconnection attempts in case the connection is dropped.
  Default is `3`. Pass `0` or `always` to keep trying. Pass `-1` or `never` to disable.
- retryDelay: the number of ms to wait before reconnecting. Default is `15`.
- baseUrl: the base url use by the `get` method. The destination url is computed using
`url.resolve`. Default is empty.
- If a field is not specified, the current configuration for this field is
  unchanged.

### Environment variables for Saucelabs

When connecting to Saucelabs, the `user` and `pwd` fields can also be set through the `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables.

The following helper are also available to update sauce jobs: `sauceJobUpdate` and `sauceJobStatus`.

### Safe Methods

The `safeExecute` and `safeEval` methods are equivalent to `execute` and `eval` but the code is
executed within a `eval` block. They are safe in the sense that eventual
code syntax issues are tackled earlier returning as syntax error and
avoiding browser hanging in some cases.

An example below of expression hanging Chrome:

```js
browser.eval("wrong!!!", function(err, res) { // hangs
browser.safeEval("wrong!!!", function(err, res) { // returns
browser.execute("wrong!!!", function(err, res) { //hangs
browser.safeExecute("wrong!!!", function(err, res) { //returns
```

## Working with mobile device emulators

It is possible to use `wd` to test mobile devices using either Selenium or Appium. However
in either case the full JsonWire protocol is not supported (or is buggy).

Examples [here](https://github.com/admc/wd/tree/master/examples/mobile).

### Selenium

Both Android (using AndroidDriver) and ios (using ios-driver) are supported, locally or using
Sauce Labs cloud.

### Appium

Android is only supported locally.

ios6 is supported locally or using Sauce Labs cloud. There is an issue with ios7, the Appium
team is working to solve it.

## Run the tests!

```
# Install the Selenium server, Chromedriver connect
node_modules/.bin/install_selenium
node_modules/.bin/install_chromedriver

#Run the selenium server with chromedriver:
node_modules/.bin/start_selenium_with_chromedriver

cd wd
npm install
make test

# look at the results!
```

## Run the tests on Sauce Labs cloud!

```
# Install Sauce Connect
node_modules/.bin/install_sauce_connect

# Set the following env variales: SAUCE_USERNAME and SAUCE_ACCESS_KEY

# Start Sauce Sonnect:
node_modules/.bin/start_sauce_connect

cd wd
npm install
make test_e2e_sauce # may be run without sauce connect
make test_midway_sauce_connect

# look at the results on Saucelabs site!
```

## Adding new method / Contributing

If the method you want to use is not yet implemented, that should be
easy to add it to `lib/webdriver.js`. You can use the `doubleclick`
method as a template for methods not returning data, and `getOrientation`
for methods which returns data. No need to modify README as the doc
generation is automated. Other contributions are welcomed.

## Generating doc

The JsonWire mappings in the README and mapping files are generated from code
comments using [dox](https://github.com/visionmedia/dox).

To update the mappings run the following commands:

```
make mapping > doc/api.md
make full_mapping > doc/jsonwire-full-mapping.md
make unsupported_mapping > doc/jsonwire-unsupported-mapping.md
```

## Publishing

```
npm version [patch|minor|major]
git push --tags origin master
npm publish
```

## Test Coverage

[test coverage](http://admc.io/wd/istanbul/coverage/lcov-report/lib/index.html)


