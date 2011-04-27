# WD.js -- A super light weight WebDriver/Selenium 2 client for node.js

## Update node to 4.latest

http://nodejs.org/#download

## Install - SOON

<pre>
npm install wd
</pre>

## Usage

<pre>
): cd lib
): node
> var wd = require("./main")
> x = wd.createWebDriver() or wd.createWebDriver("ondemand.saucelabs.com", 80, "username", "apikey")
> x.init() or x.init({desired capabilities ovveride})
> x.url("http://www.url.com")
> x.exec("window.location.href", function(o) { console.log(o) })
> x.close();
> x.quit()
</pre>
