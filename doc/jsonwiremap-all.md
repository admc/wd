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
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window_handle">/session/:sessionId/window_handle</a><br>
        Retrieve the current window handle.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window_handles">/session/:sessionId/window_handles</a><br>
        Retrieve the list of all window handles available to the session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
            evaluate expression: <br>
            eval(code, cb) -> cb(err, value)
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
        executeAsync(code, args, cb) -> cb(err, value returned)
        <ul>
          <li>args is an optional Array</li>
        </ul>        
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/screenshot">/session/:sessionId/screenshot</a><br>
        Take a screenshot of the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/ime/available_engines">/session/:sessionId/ime/available_engines</a><br>
        List all available engines on the machine.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/ime/active_engine">/session/:sessionId/ime/active_engine</a><br>
        Get the name of the active IME engine.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/ime/activated">/session/:sessionId/ime/activated</a><br>
        Indicates whether IME input is active at the moment (not if it's available.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/ime/deactivate">/session/:sessionId/ime/deactivate</a><br>
        De-activates the currently-active IME engine.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/ime/activate">/session/:sessionId/ime/activate</a><br>
        Make an engines that is available (appears on the listreturned by getAvailableEngines) active.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/frame">/session/:sessionId/frame</a><br>
        Change focus to another frame on the page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window">/session/:sessionId/window</a><br>
        Change focus to another window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/size">/session/:sessionId/window/:windowHandle/size</a><br>
        Change the size of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window/:windowHandle/size">/session/:sessionId/window/:windowHandle/size</a><br>
        Get the size of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/position">/session/:sessionId/window/:windowHandle/position</a><br>
        Change the position of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/window/:windowHandle/position">/session/:sessionId/window/:windowHandle/position</a><br>
        Get the position of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/window/:windowHandle/maximize">/session/:sessionId/window/:windowHandle/maximize</a><br>
        Maximize the specified window if not already maximized.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/source">/session/:sessionId/source</a><br>
        Get the current page source.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id">/session/:sessionId/element/:id</a><br>
        Describe the identified element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/:id/element">/session/:sessionId/element/:id/element</a><br>
        Search for an element on the page, starting from the identified element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/:id/elements">/session/:sessionId/element/:id/elements</a><br>
        Search for multiple elements on the page, starting from the identified element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/element/:id/submit">/session/:sessionId/element/:id/submit</a><br>
        Submit a <tt>FORM</tt> element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/name">/session/:sessionId/element/:id/name</a><br>
        Query for an element's tag name.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/selected">/session/:sessionId/element/:id/selected</a>
        Determine if an <tt>OPTION</tt> element, or an <tt>INPUT</tt> element of type <tt>checkbox</tt> or <tt>radiobutton</tt> is currently selected.<br>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/enabled">/session/:sessionId/element/:id/enabled</a><br>
        Determine if an element is currently enabled.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/equals/:other">/session/:sessionId/element/:id/equals/:other</a><br>
        Test if two element IDs refer to the same DOM element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/displayed">/session/:sessionId/element/:id/displayed</a><br>
        Determine if an element is currently displayed.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/location">/session/:sessionId/element/:id/location</a><br>
        Determine an element's location on the page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/location_in_view">/session/:sessionId/element/:id/location_in_view</a><br>
        Determine an element's location on the screen once it has been scrolled into view.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/size">/session/:sessionId/element/:id/size</a><br>
        Determine an element's size in pixels.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/element/:id/css/:propertyName">/session/:sessionId/element/:id/css/:propertyName</a><br>
        Query the value of an element's computed CSS property.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/orientation">/session/:sessionId/orientation</a><br>
        Get the current browser orientation.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/orientation">/session/:sessionId/orientation</a><br>
        Set the browser orientation.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/alert_text">/session/:sessionId/alert_text</a><br>
        Gets the text of the currently displayed JavaScript <tt>alert()</tt>, <tt>confirm()</tt>, or <tt>prompt()</tt> dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/alert_text">/session/:sessionId/alert_text</a><br>
        Sends keystrokes to a JavaScript <tt>prompt()</tt> dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/touch/click">/session/:sessionId/touch/click</a><br>
        Single tap on the touch enabled device.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/touch/down">/session/:sessionId/touch/down</a><br>
        Finger down on the screen.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/touch/up">/session/:sessionId/touch/up</a><br>
        Finger up on the screen.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/move">session/:sessionId/touch/move</a><br>
        Finger move on the screen.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/scroll">session/:sessionId/touch/scroll</a><br>
        Scroll on the touch screen using finger based motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/scroll">session/:sessionId/touch/scroll</a><br>
        Scroll on the touch screen using finger based motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/doubleclick">session/:sessionId/touch/doubleclick</a><br>
        Double tap on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/longclick">session/:sessionId/touch/longclick</a><br>
        Long press on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/flick">session/:sessionId/touch/flick</a><br>
        Flick on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_session/:sessionId/touch/flick">session/:sessionId/touch/flick</a><br>
        Flick on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/location">/session/:sessionId/location</a><br>
        Get the current geo location.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/location">/session/:sessionId/location</a><br>
        Set the current geo location.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/local_storage">/session/:sessionId/local_storage</a><br>
        Get all keys of the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/local_storage">/session/:sessionId/local_storage</a><br>
        Set the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/local_storage">/session/:sessionId/local_storage</a><br>
        Clear the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/local_storage/key/:key">/session/:sessionId/local_storage/key/:key</a><br>
        Get the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/local_storage/key/:key">/session/:sessionId/local_storage/key/:key</a><br>
        Remove the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/local_storage/size">/session/:sessionId/local_storage/size</a><br>
        Get the number of items in the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/session_storage">/session/:sessionId/session_storage</a><br>
        Get all keys of the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#POST_/session/:sessionId/session_storage">/session/:sessionId/session_storage</a><br>
        Set the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/session_storage">/session/:sessionId/session_storage</a><br>
        Clear the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/session_storage/key/:key">/session/:sessionId/session_storage/key/:key</a><br>
        Get the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#DELETE_/session/:sessionId/session_storage/key/:key">/session/:sessionId/session_storage/key/:key</a><br>
        Remove the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET&nbsp;<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#GET_/session/:sessionId/session_storage/size">/session/:sessionId/session_storage/size</a><br>
        Get the number of items in the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        NA
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
