# WD.js -- A super light weight WebDriver/Selenium 2 client for node.js

## Update node to 4.latest

http://nodejs.org/#download

## Install

<pre>
npm install wd
</pre>

## Usage

<pre>
): wd shell
> x = wd.remote() or wd.remote("ondemand.saucelabs.com", 80, "username", "apikey")
> x.init() or x.init({desired capabilities ovveride})
> x.url("http://www.url.com")
> x.exec("window.location.href", function(o) { console.log(o) })
> x.close();
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
    browser.exec("window.location.href", function(o) {
      //print the js output
      console.log(o);
      //goto another url
      browser.get("http://www.seleniumhq.org", function() {
        //close the browser
        browser.close(function() {
          //kill the session
          browser.quit()
        })
      })
    })
  })
})

</pre>