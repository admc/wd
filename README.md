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

desired = {
  browserName:'chrome'
  , tags: ["examples"]
  , name = "This is an example test"
}

browser.init(desired, function() {
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

<table class="wikitable">
  <tbody>
    <tr>
      <td width="50%" style="border: 1px solid #ccc; padding: 5px;">
        <strong>JsonWireProtocol</strong>
      </td>
      <td width="50%" style="border: 1px solid #ccc; padding: 5px;">
        <strong>wd</strong>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/status">/status</a><br>
        Query the server's current status.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        status(cb) -> cb(err, status)
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session">/session</a><br>
        Create a new session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        init(desired, cb) -> cb(err, sessionID)
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/sessions">/sessions</a><br>
        Returns a list of the currently active sessions.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>all sessions: sessions(cb) -> cb(err, sessions)</li>
          <li>
            current session: <br>
            altSessionCapabilities(cb) -> cb(err, capabilities)
          </li>
        </ul>
      </td>      
    </tr>    
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId">/session/:sessionId</a><br>
        Retrieve the capabilities of the specified session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        sessionCapabilities(cb) -> cb(err, capabilities)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId">/session/:sessionId</a><br>
        Delete the session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        quit(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/timeouts">/session/:sessionId/timeouts</a><br>
        Configure the amount of time that a particular type of operation can execute for before they are aborted and a |Timeout| error is returned to the client.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            configurable type: NA (but setImplicitWaitTimeout and 
            setAsyncScriptTimeout do the same)
          </li>
          <li>
              page load timeout: <br>
              setPageLoadTimeout(ms, cb) -> cb(err)
          </li>
        </ul>         
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/timeouts/async_script">/session/:sessionId/timeouts/async_script</a><br>
        Set the amount of time, in milliseconds, that asynchronous scripts executed by <tt>/session/:sessionId/execute_async</tt> are permitted to run before they are aborted and a |Timeout| error is returned to the client.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        setAsyncScriptTimeout(ms, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/timeouts/implicit_wait">/session/:sessionId/timeouts/implicit_wait</a><br>
        Set the amount of time the driver should wait when searching for elements.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        setImplicitWaitTimeout(ms, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/url">/session/:sessionId/url</a><br>
        Retrieve the URL of the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        url(cb) -> cb(err, url)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/url">/session/:sessionId/url</a><br>
        Navigate to a new URL.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        get(url,cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/forward">/session/:sessionId/forward</a><br>
        Navigate forwards in the browser history, if possible.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        forward(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/back">/session/:sessionId/back</a><br>
        Navigate backwards in the browser history, if possible.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        back(cb) -> cb(err)
      </td>      
    </tr>    
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/refresh">/session/:sessionId/refresh</a><br>
        Refresh the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        refresh(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/execute">/session/:sessionId/execute</a><br>
        Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            execute script: <br>
            execute(code, args, cb) -> cb(err, value returned)
            <ul>
              <li>args is an optional Array</li>
            </ul>
          </li>
          <li>
            execute script using eval(code): <br>
            safeExecute(code, args, cb) -> cb(err, value returned)
            <ul>
              <li>args is an optional Array</li>
            </ul>
          </li>
          <li>
            evaluate expression (using execute): <br>
            eval(code, cb) -> cb(err, value)
          </li>
          <li>
            evaluate expression (using safeExecute): <br>
            safeEval(code, cb) -> cb(err, value)
          </li>
        </ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/execute_async">/session/:sessionId/execute_async</a><br>
        Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            execute async script: <br>
            executeAsync(code, args, cb) -> cb(err, value returned)
            <ul>
              <li>args is an optional Array</li>
            </ul>
          </li>
          <li>
            execute async script using eval(code): <br>
            safeExecuteAsync(code, args, cb) -> cb(err, value returned)
            <ul>
              <li>args is an optional Array</li>
            </ul>
          </li>
        </ul>   
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/window">/session/:sessionId/window</a><br>
        Close the current window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        close(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/cookie">/session/:sessionId/cookie</a><br>
        Retrieve all cookies visible to the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        allCookies() -> cb(err, cookies)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/cookie">/session/:sessionId/cookie</a><br>
        Set a cookie.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        setCookie(cookie, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/cookie">/session/:sessionId/cookie</a><br>
        Delete all cookies visible to the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        deleteAllCookies(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/cookie/:name">/session/:sessionId/cookie/:name</a><br>
        Delete the cookie with the given name.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        deleteCookie(name, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/title">/session/:sessionId/title</a><br>
        Get the current page title.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        title(cb) -> cb(err, title)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element">/session/:sessionId/element</a><br>
        Search for an element on the page, starting from the document root.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            element(using, value, cb) -> cb(err, element) <br>
          </li>
          <li>
            element<i>suffix</i>(value, cb) -> cb(err, element) <br> 
              <i>suffix:  
              ByClassName, ByCssSelector, ById,  
              ByName, ByLinkText, ByPartialLinkText, 
              ByTagName, ByXPath, ByCss</i>
          </li>
          <li>
            see also hasElement, hasElement<i>suffix</i>, elementOrNull, element<i>suffix</i>OrNull, 
            elementIfExists, element<i>suffix</i>IfExists, in the elements section.
          </li>
        <ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/elements">/session/:sessionId/elements</a><br>
        Search for multiple elements on the page, starting from the document root.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            elements(using, value, cb) -> cb(err, elements) <br>
          </li>
          <li>
            elements<i>suffix</i>(value, cb) -> cb(err, elements) <br> 
              <i>suffix:  
              ByClassName, ByCssSelector, ById,  
              ByName, ByLinkText, ByPartialLinkText, 
              ByTagName, ByXPath, ByCss</i>
          </li>
          <li>
            hasElement(using, value, cb) -> cb(err, boolean) <br>
          </li>
          <li>
            hasElement<i>suffix</i>(value, cb) -> cb(err, boolean) <br> 
              <i>suffix:  
              ByClassName, ByCssSelector, ById,  
              ByName, ByLinkText, ByPartialLinkText, 
              ByTagName, ByXPath, ByCss</i>
          </li>                    
          <li>
            elementOrNull(using, value, cb) -> cb(err, element) <br>
            (avoids not found error throw and returns null instead)   
          </li>
          <li>
            element<i>suffix</i>OrNull(value, cb) -> cb(err, element) <br> 
            (avoids not found error throw and returns null instead) <br>
              <i>suffix:  
              ByClassName, ByCssSelector, ById,  
              ByName, ByLinkText, ByPartialLinkText, 
              ByTagName, ByXPath, ByCss</i>
          </li>
          <li>
            elementIfExists(using, value, cb) -> cb(err, element) <br>
            (avoids not found error throw and returns undefined instead)   
          </li>
          <li>
            element<i>suffix</i>IfExists(value, cb) -> cb(err, element) <br> 
            (avoids not found error throw and returns undefined instead) <br>
              <i>suffix:  
              ByClassName, ByCssSelector, ById,  
              ByName, ByLinkText, ByPartialLinkText, 
              ByTagName, ByXPath, ByCss</i>
          </li>
        <ul>
      </td>      
    </tr>    
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/active">/session/:sessionId/element/active</a><br>
        Get the element on the page that currently has focus.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        active(cb) -> cb(err, element)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/:id/click">/session/:sessionId/element/:id/click</a><br>
        Click on an element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        clickElement(element, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/text">/session/:sessionId/element/:id/text</a><br>
        Returns the visible text for the element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            text(element, cb) -> (err, text)
          </li>
          <li>
            textPresent(searchText, element, cb) -> (err, boolean)
          </li>  
        </ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/:id/value">/session/:sessionId/element/:id/value</a><br>
        Send a sequence of key strokes to an element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            type(element, keys, cb) -> cb(err)
          </li>
          <li>
            special key map: wd.SPECIAL_KEYS (see lib/special-keys.js)
          </li>
        </ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/keys">/session/:sessionId/keys</a><br>
        Send a sequence of key strokes to the active element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            keys(keys, cb) -> cb(err)
          </li>
          <li>
            special key map: wd.SPECIAL_KEYS (see lib/special-keys.js)
          </li>
        </ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/:id/clear">/session/:sessionId/element/:id/clear</a><br>
        Clear a <tt>TEXTAREA</tt> or <tt>text INPUT</tt> element's value.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        clear(element, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/attribute/:name">/session/:sessionId/element/:id/attribute/:name</a><br>
        Get the value of an element's attribute.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <ul>
          <li>
            getAttribute(element, attrName, cb) -> cb(err, value)
          </li>
          <li>
            getValue(element, cb) -> cb(err, value)
          </li>
        </ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/accept_alert">/session/:sessionId/accept_alert</a><br>
        Accepts the currently displayed alert dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        acceptAlert(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/dismiss_alert">/session/:sessionId/dismiss_alert</a><br>
        Dismisses the currently displayed alert dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        dismissAlert(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/moveto">/session/:sessionId/moveto</a><br>
        Move the mouse by an offset of the specificed element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        moveTo(element, xoffset, yoffset, cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/click">/session/:sessionId/click</a><br>
        Click any mouse button (at the coordinates set by the last moveto command).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        click(button, cb) -> cb(err)  <br>
        buttons: {left: 0, middle: 1 , right: 2}
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/buttondown">/session/:sessionId/buttondown</a><br>
        Click and hold the left mouse button (at the coordinates set by the last moveto command).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        buttonDown(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/buttonup">/session/:sessionId/buttonup</a><br>
        Releases the mouse button previously held (where the mouse is currently at).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        buttonUp(cb) -> cb(err)
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/doubleclick">/session/:sessionId/doubleclick</a><br>
        Double-clicks at the current mouse coordinates (set by moveto).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        doubleclick(cb) -> cb(err) <br>
      </td>      
    </tr>    
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        EXTRA: waitForCondition<br>
        Waits for JavaScript condition to be true (polling within wd client).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        waitForCondition(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)
        <ul>
        <li>conditionExpr should return a boolean</li>
        <li>timeout and pollFreq are optional (default: 1000, 100).</li>
        <li>return true if condition satisfied, error otherwise.</li>
        </ul>
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        EXTRA: waitForConditionInBrowser<br>
        Waits for JavaScript condition to be true. (async script polling within browser)
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        waitForConditionInBrowser(conditionExpr, timeout, pollFreq, cb) -> cb(err, boolean)
        <ul>
        <li>setAsyncScriptTimeout must be set to value higher than timeout</li>
        <li>conditionExpr should return a boolean</li>
        <li>timeout and pollFreq are optional (default: 1000, 100).</li>
        <li>return true if condition satisfied, error otherwise.</li>
        </ul>
      </td>      
    </tr>    
  </tbody>
</table>

### Full JsonWireProtocol mapping:

[full mapping](https://github.com/sebv/wd/blob/master/doc/jsonwiremap-all.md)

## More docs!
<pre>
WD is simply implementing the Selenium JsonWireProtocol, for more details see the official docs:
 - <a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol">http://code.google.com/p/selenium/wiki/JsonWireProtocol</a>
</pre>

## Run the tests!
<pre>
  - Run the selenium server with chromedriver: 
      java -jar selenium-server-standalone-2.21.0.jar -Dwebdriver.chrome.driver=&lt;PATH&gt;/chromedriver
  - cd wd
  - npm install .
  - make test
  - look at the results!
</pre>
