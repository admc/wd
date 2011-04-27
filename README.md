# WD.js -- A super light weight WebDriver/Selenium 2 client for node.js

## Install - SOON

<pre>
npm install wd
</pre>

## Usage

<pre>
): node
> var wd = require("./main")
> wd.createWebDriver() or wd.createWebDriver("ondemand.saucelabs.com", 80)
> wd.init() or wd.init({username:'sauce username', accessKey:'sauce api key'})
> wd.url("http://www.url.com")
> wd.exec("window.location.href", function(o) { console.log(o) })
> wd.close();
> wd.quit()
