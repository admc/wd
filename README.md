# WD.js -- WebDriver/Selenium 2 for node.js
  - Mailing List: https://groups.google.com/forum/#!forum/wdjs

## Status

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

## 0.2.x Release

### 0.2.0

- New wrapper: promise chain.
- Old chain api is deprecated (It is still available, but you will see a depreciation message).
- There are some changes in the way the element and webdriver classes are passed around
which may affect external wrappers. External wrappers should now subclass those 2 classes. 

### 0.2.1
 
- New test suite using the promise chain api.
- `browser.Q` was moved to `wd.Q`.

### 0.2.2 

- chai-as-promised v4 compatible.
- Promise wrappers can now be monkey patched directly.
- New saucelabs helpers.

Incompatibilities: 

  - There is a new method to call, `wd.rewrap()`, to propagate async monkey 
  patching to promise. (see [here](https://github.com/admc/wd/blob/master/examples/promise/monkey.patch-with-async.js#L35) and the monkey patch section below)
  - The chai-as-promised setup has changed in V4, look out for the `transferPromiseness` 
  line in the examples. (see [here](https://github.com/admc/wd/blob/master/examples/promise/chrome.js#L15))

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

## Generators Api

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

[supported](https://github.com/admc/wd/blob/master/doc/jsonwire-mapping.md)

[full json wire mapping](https://github.com/admc/wd/blob/master/doc/jsonwire-full-mapping.md)

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

#### Url object created via `url.parse`

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

### Monkey patching

You may want to monkey patch the webdriver class in order to add custom functionalities.
Please refer to the following examples:

- [pure promise](https://github.com/admc/wd/blob/master/examples/promise/monkey.patch.js).
- [async patch used by promise](https://github.com/admc/wd/blob/master/examples/promise/monkey.patch-with-async.js).
- [promise no-chain](https://github.com/admc/wd/blob/master/examples/promise/monkey.patch-no-chain.js).
- [full async](https://github.com/admc/wd/blob/master/examples/async/monkey.patch.js).

Caveat: You now need to call `wd.rewrap()` to propagate async monkey patching to the 
promise wrapper. This will ovewrite the promise wrapper prototype, so you need to do 
your monkey patching in order, async first, call `wd.rewrap()` , and only then promise.

### Promise helpers

This is a clean alternative to monkey patching.
See example [here](https://github.com/admc/wd/blob/master/examples/promise/helper.js).

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
make mapping > doc/jsonwire-mapping.md
make full_mapping > doc/jsonwire-full-mapping.md
make unsupported_mapping > doc/jsonwire-unsupported-mapping.md
```

## Publishing

```
npm version [patch|minor|major]
git push --tags
npm publish
```

## Test Coverage

[test coverage](http://admc.io/wd/istanbul/coverage/lcov-report/index.html)
