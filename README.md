# WD.js -- A light weight WebDriver/Se2 client for node.js

## Update node to latest

http://nodejs.org/#download

## Install

<pre>
npm install wd
</pre>

## Authors

  - Adam Christian ([admc](http://github.com/admc))
  - Ruben Daniels ([javruben](https://github.com/javruben))
  - Peter Braden ([peterbraden](https://github.com/peterbraden))
  - Seb Vincent ([sebv](https://github.com/sebv))
  
## License

  * License - Apache 2: http://www.apache.org/licenses/LICENSE-2.0

## Usage

<pre>
): wd shell
> x = wd.remote() or wd.remote("ondemand.saucelabs.com", 80, "username", "apikey")

//Adding additional desired capabilities
x.desiredCapabilities.public = true;
x.desiredCapabilities.tags = ["one", "boom"];

> x.init() or x.init({desired capabilities ovveride})
> x.get("http://www.url.com")
> x.eval("window.location.href", function(e, o) { console.log(o) })
> x.quit()
</pre>


## Writing a test!

<pre>
var webdriver = require('wd')
  , assert = require('assert');

var browser = webdriver.remote();

browser.on('status', function(info){
  console.log('\x1b[36m%s\x1b[0m', info);
});
browser.on('command', function(meth, path){
  console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
});

browser.desiredCapabilities.tags = ["examples"];
browser.desiredCapabilities.name = "This is an example test";

browser.init({browserName:'chrome'}, function() {
  browser.get("http://saucelabs.com/test/guinea-pig", function() {
    browser.title(function(err, title) {
      assert.ok(~title.indexOf('I am a page title - Sauce Labs'), 'Wrong title!');
      browser.elementById('submit', function(err, el) {
        browser.clickElement(el, function() {
          browser.eval("window.location.href", function(err, title) {
            assert.ok(~title.indexOf('#'), 'Wrong title!');
            browser.quit()
          })
        })
      })
    })
  })
})
</pre>

## Supported Methods

<pre>
  - 'close': Close the browser
  - 'quit': Quit the session
  - 'eval': Eval JS and return the value (takes a code string)
  - 'execute': Eval JS (takes a code string)
  - 'executeAsync': Execute JS in an async way (takes a code string)
  - 'get': Navigate the browser to the provided url (takes a URL)
  - 'setWaitTimeout': Set the implicit wait timeout in milliseonds (takes wait time in ms)
  - 'element': Access an element in the page (takes 'using' and 'value' so ex: 'id', 'idofelement')
  - 'moveTo': Move an element on the page (takes element, xoffset and yoffset'
  - 'scroll': Scroll on an element (takes element, xoffset, yoffset)
  - 'buttonDown': Click and hold the left mouse button down, at the coords of the last moveTo
  - 'buttonUp': Release the left mouse button
  - 'click': Click a mouse button, at the coords of the last moveTo (takes a button param for {LEFT = 0, MIDDLE = 1 , RIGHT = 2})
  - 'doubleClick': Double click a mouse button, same coords as click
  - 'type': Type! (takes an element, a key character, or an array of char keys)
  - 'active': Get the element on the page currently with focus
  - 'keyToggle': Press a keyboard key (takes an element and a key character'
  - 'setCookie': Sets a <a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#Cookie_JSON_Object">cookie</a>
</pre>

## More docs!
<pre>
WD is simply implementing the Selenium JsonWireProtocol, for more details see the official docs:
 - <a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol">http://code.google.com/p/selenium/wiki/JsonWireProtocol</a>
</pre>
