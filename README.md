# WD.js -- A super light weight WebDriver/Selenium 2 client for node.js

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

## Usage

<pre>
): wd shell
> x = wd.remote() or wd.remote("ondemand.saucelabs.com", 80, "username", "apikey")
> x.init() or x.init({desired capabilities ovveride})
> x.url("http://www.url.com")
> x.eval("window.location.href", function(e, o) { console.log(o) })
> x.quit()
</pre>


## Writing a test!

<pre>
var webdriver = require("wd")

//get a new intsance
var browser = webdriver.remote();

//instantiate the session
browser.init({browserName:"chrome"}, function() {
  //goto url
  browser.get("http://www.jelly.io", function() {
    //exec js
    browser.eval("window.location.href", function(a, o) {
      //print the js output
      console.log(o);
      //goto another url
      browser.get("http://www.seleniumhq.org", function() {
        //kill the session and browser
        browser.quit(function() {
          //kill the session
          console.log("DONE!");
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
</pre>

## More docs!
<pre>
WD is simply implementing the Selenium JsonWireProtocol, for more details see the official docs:
 - http://code.google.com/p/selenium/wiki/JsonWireProtocol
</pre>
