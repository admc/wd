<table class="wikitable">
  <tbody>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <strong>HTTP Method</strong>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <strong>Path</strong>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <strong>Summary</strong>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <strong>wd equivalent</strong>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/status">/status</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Query the server's current status.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        status(cb)
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session">/session</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Create a new session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        init(desired, cb)
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/sessions">/sessions</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Returns a list of the currently active sessions.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId">/session/:sessionId</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Retrieve the capabilities of the specified session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId">/session/:sessionId</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Delete the session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/timeouts">/session/:sessionId/timeouts</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Configure the amount of time that a particular type of operation can execute for before they are aborted and a |Timeout| error is returned to the client.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/timeouts/async_script">/session/:sessionId/timeouts/async_script</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set the amount of time, in milliseconds, that asynchronous scripts executed by <tt>/session/:sessionId/execute_async</tt> are permitted to run before they are aborted and a |Timeout| error is returned to the client.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/timeouts/implicit_wait">/session/:sessionId/timeouts/implicit_wait</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set the amount of time the driver should wait when searching for elements.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/window_handle">/session/:sessionId/window_handle</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Retrieve the current window handle.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/window_handles">/session/:sessionId/window_handles</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Retrieve the list of all window handles available to the session.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/url">/session/:sessionId/url</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Retrieve the URL of the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/url">/session/:sessionId/url</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Navigate to a new URL.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/forward">/session/:sessionId/forward</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Navigate forwards in the browser history, if possible.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/back">/session/:sessionId/back</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Navigate backwards in the browser history, if possible.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/refresh">/session/:sessionId/refresh</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Refresh the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/execute">/session/:sessionId/execute</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/execute_async">/session/:sessionId/execute_async</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/screenshot">/session/:sessionId/screenshot</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Take a screenshot of the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/ime/available_engines">/session/:sessionId/ime/available_engines</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        List all available engines on the machine.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/ime/active_engine">/session/:sessionId/ime/active_engine</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the name of the active IME engine.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/ime/activated">/session/:sessionId/ime/activated</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Indicates whether IME input is active at the moment (not if it's available.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/ime/deactivate">/session/:sessionId/ime/deactivate</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        De-activates the currently-active IME engine.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/ime/activate">/session/:sessionId/ime/activate</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Make an engines that is available (appears on the listreturned by getAvailableEngines) active.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/frame">/session/:sessionId/frame</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Change focus to another frame on the page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/window">/session/:sessionId/window</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Change focus to another window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/window">/session/:sessionId/window</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Close the current window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/window/:windowHandle/size">/session/:sessionId/window/:windowHandle/size</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Change the size of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/window/:windowHandle/size">/session/:sessionId/window/:windowHandle/size</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the size of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/window/:windowHandle/position">/session/:sessionId/window/:windowHandle/position</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Change the position of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/window/:windowHandle/position">/session/:sessionId/window/:windowHandle/position</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the position of the specified window.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/window/:windowHandle/maximize">/session/:sessionId/window/:windowHandle/maximize</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Maximize the specified window if not already maximized.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/cookie">/session/:sessionId/cookie</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Retrieve all cookies visible to the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/cookie">/session/:sessionId/cookie</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set a cookie.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/cookie">/session/:sessionId/cookie</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Delete all cookies visible to the current page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/cookie/:name">/session/:sessionId/cookie/:name</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Delete the cookie with the given name.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/source">/session/:sessionId/source</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the current page source.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/title">/session/:sessionId/title</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the current page title.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element">/session/:sessionId/element</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Search for an element on the page, starting from the document root.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/elements">/session/:sessionId/elements</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Search for multiple elements on the page, starting from the document root.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/active">/session/:sessionId/element/active</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the element on the page that currently has focus.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id">/session/:sessionId/element/:id</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Describe the identified element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/:id/element">/session/:sessionId/element/:id/element</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Search for an element on the page, starting from the identified element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/:id/elements">/session/:sessionId/element/:id/elements</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Search for multiple elements on the page, starting from the identified element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/:id/click">/session/:sessionId/element/:id/click</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Click on an element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/:id/submit">/session/:sessionId/element/:id/submit</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Submit a <tt>FORM</tt> element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/text">/session/:sessionId/element/:id/text</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Returns the visible text for the element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/:id/value">/session/:sessionId/element/:id/value</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Send a sequence of key strokes to an element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/keys">/session/:sessionId/keys</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Send a sequence of key strokes to the active element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/name">/session/:sessionId/element/:id/name</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Query for an element's tag name.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/element/:id/clear">/session/:sessionId/element/:id/clear</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Clear a <tt>TEXTAREA</tt> or <tt>text INPUT</tt> element's value.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/selected">/session/:sessionId/element/:id/selected</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Determine if an <tt>OPTION</tt> element, or an <tt>INPUT</tt> element of type <tt>checkbox</tt> or <tt>radiobutton</tt> is currently selected.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/enabled">/session/:sessionId/element/:id/enabled</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Determine if an element is currently enabled.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/attribute/:name">/session/:sessionId/element/:id/attribute/:name</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the value of an element's attribute.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/equals/:other">/session/:sessionId/element/:id/equals/:other</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Test if two element IDs refer to the same DOM element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/displayed">/session/:sessionId/element/:id/displayed</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Determine if an element is currently displayed.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/location">/session/:sessionId/element/:id/location</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Determine an element's location on the page.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/location_in_view">/session/:sessionId/element/:id/location_in_view</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Determine an element's location on the screen once it has been scrolled into view.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/size">/session/:sessionId/element/:id/size</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Determine an element's size in pixels.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/element/:id/css/:propertyName">/session/:sessionId/element/:id/css/:propertyName</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Query the value of an element's computed CSS property.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/orientation">/session/:sessionId/orientation</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the current browser orientation.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/orientation">/session/:sessionId/orientation</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set the browser orientation.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/alert_text">/session/:sessionId/alert_text</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Gets the text of the currently displayed JavaScript <tt>alert()</tt>, <tt>confirm()</tt>, or <tt>prompt()</tt> dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/alert_text">/session/:sessionId/alert_text</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Sends keystrokes to a JavaScript <tt>prompt()</tt> dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/accept_alert">/session/:sessionId/accept_alert</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Accepts the currently displayed alert dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/dismiss_alert">/session/:sessionId/dismiss_alert</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Dismisses the currently displayed alert dialog.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/moveto">/session/:sessionId/moveto</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Move the mouse by an offset of the specificed element.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/click">/session/:sessionId/click</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Click any mouse button (at the coordinates set by the last moveto command).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/buttondown">/session/:sessionId/buttondown</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Click and hold the left mouse button (at the coordinates set by the last moveto command).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/buttonup">/session/:sessionId/buttonup</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Releases the mouse button previously held (where the mouse is currently at).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/doubleclick">/session/:sessionId/doubleclick</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Double-clicks at the current mouse coordinates (set by moveto).
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/touch/click">/session/:sessionId/touch/click</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Single tap on the touch enabled device.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/touch/down">/session/:sessionId/touch/down</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Finger down on the screen.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/touch/up">/session/:sessionId/touch/up</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Finger up on the screen.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/move">session/:sessionId/touch/move</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Finger move on the screen.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/scroll">session/:sessionId/touch/scroll</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Scroll on the touch screen using finger based motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/scroll">session/:sessionId/touch/scroll</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Scroll on the touch screen using finger based motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/doubleclick">session/:sessionId/touch/doubleclick</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Double tap on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/longclick">session/:sessionId/touch/longclick</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Long press on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/flick">session/:sessionId/touch/flick</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Flick on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_session/:sessionId/touch/flick">session/:sessionId/touch/flick</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Flick on the touch screen using finger motion events.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/location">/session/:sessionId/location</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the current geo location.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/location">/session/:sessionId/location</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set the current geo location.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/local_storage">/session/:sessionId/local_storage</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get all keys of the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/local_storage">/session/:sessionId/local_storage</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/local_storage">/session/:sessionId/local_storage</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Clear the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/local_storage/key/:key">/session/:sessionId/local_storage/key/:key</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/local_storage/key/:key">/session/:sessionId/local_storage/key/:key</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Remove the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/local_storage/size">/session/:sessionId/local_storage/size</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the number of items in the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/session_storage">/session/:sessionId/session_storage</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get all keys of the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        POST
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#POST_/session/:sessionId/session_storage">/session/:sessionId/session_storage</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Set the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/session_storage">/session/:sessionId/session_storage</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Clear the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/session_storage/key/:key">/session/:sessionId/session_storage/key/:key</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        DELETE
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#DELETE_/session/:sessionId/session_storage/key/:key">/session/:sessionId/session_storage/key/:key</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Remove the storage item for the given key.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 5px;">
        GET
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        <a href="#GET_/session/:sessionId/session_storage/size">/session/:sessionId/session_storage/size</a>
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        Get the number of items in the storage.
      </td>
      <td style="border: 1px solid #ccc; padding: 5px;">
        &nbsp;
      </td>      
    </tr>
  </tbody>
</table>
