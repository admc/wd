# Release Notes

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

  - There is a new method to call, `wd.rewrap()`, to propagate async monkey patching to promise.
  (see [here](https://github.com/admc/wd/blob/master/examples/promise/monkey.patch-with-async.js#L35)
  and the monkey patch section in README) [Note: monkey patching and `rewrap` note recommended from 0.2.3].
  - The chai-as-promised setup has changed in v4, look out for the `transferPromiseness` (Requires chai-as-promised 4.1.0 or greater)
  line in the examples. (see [here](https://github.com/admc/wd/blob/master/examples/promise/chrome.js#L15)).

### 0.2.3

  - Http configuration enhancements + base url, see doc [here](https://github.com/admc/wd#http-configuration--base-url).
  - `waitFor`, `waitForElement` and asserters replacing existing wait methods.
  - `addPromiseChainMethod`/`addPromiseMethod`/`addAsyncMethod`/`removeMethod` replacing monkey patching
  (Please refer to the add method section in README).
  - Support for external promise libraries.
  - New saveScreenshot method.

### 0.2.4

  - bugfix: android safeExecute.
  - bugfix: passing argument to execute.
  - bugfix: setOrientation.
  - migrating from string.js to underscore.string.

### 0.2.5 

  - Webdriver and Element refactoring
  - Easier wd customization via `wd.setBaseClasses(Webdriver, Element)`

### 0.2.6

  - bugfix: Removed the tmp dependencies.
  - isDisplayed/isNotDisplayed asserters
  - isVisible depreciation
  - bugfix: Removed the tmp dependencies.
  - bugfix: Value not defaulted when inititializing with `url.parse`.
  - bugfix: url relative now use `url.resolve`.

### 0.2.7
  - `attach`/`detach` session.
  - add `asyncRemote` and make `remote` generic.

### 0.2.8
  - added nodeify to transferPromiseness.

### 0.2.9
  - http emit fix.
  - added print method
  - added at, nth, first, second, third, last to promise api

### 0.2.10 (latest)
  - packages upgrade to latest.

### LONG TERM
  - Better error report using domain
  - Integrate with node-saucelabs + make the sauce rest url configurable
  - Add wait for elements
  - Implement all the missing methods
  - Appium mobile methods
  - add a util with most commonly used desired config (selenium+appium)
  - jQuery addOn + asserters (including jquery visible/hidden) (todo)
  - better remote/init process
