var JSONWIRE_ERRORS = {
0: {
  status: 0,
  summary:'Success', 
  detail:'The command executed successfully.'}
, 7: {
  status: 7,
  summary:'NoSuchElement', 
  detail:'An element could not be located on the page using the given search parameters.'}
, 8: {
  status: 8,
  summary:'NoSuchFrame', 
  detail:'A request to switch to a frame could not be satisfied because the frame could not be found.'}
, 9: {
  status: 9,
  summary:'UnknownCommand', 
  detail:'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.'}
, 10: {
  status: 10,
  summary:'StaleElementReference', 
  detail:'An element command failed because the referenced element is no longer attached to the DOM.'}
, 11: {
  status: 11,
  summary:'ElementNotVisible', 
  detail:'An element command could not be completed because the element is not visible on the page.'}
, 12: {
  status: 12,
  summary:'InvalidElementState', 
  detail:'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).'}
, 13: {
  status: 13,
  summary:'UnknownError', 
  detail:'An unknown server-side error occurred while processing the command.'}
, 15: {
  status: 15,
  summary:'ElementIsNotSelectable', 
  detail:'An attempt was made to select an element that cannot be selected.'}
, 17: {
  status: 17,
  summary:'JavaScriptError', 
  detail:'An error occurred while executing user supplied JavaScript.'}
, 19: {
  status: 19,
  summary:'XPathLookupError', 
  detail:'An error occurred while searching for an element by XPath.'}
, 21: {
  status: 21,
  summary:'Timeout', 
  detail:'An operation did not complete before its timeout expired.'}
, 23: {
  status: 23,
  summary:'NoSuchWindow', 
  detail:'A request to switch to a different window could not be satisfied because the window could not be found.'}
, 24: {
  status: 24,
  summary:'InvalidCookieDomain', 
  detail:'An illegal attempt was made to set a cookie under a different domain than the current page.'}
, 25: {
  status: 25,
  summary:'UnableToSetCookie', 
  detail:'A request to set a cookie\'s value could not be satisfied.'}
, 26: {
  status: 26,
  summary:'UnexpectedAlertOpen', 
  detail:'A modal dialog was open, blocking this operation'}
, 27: {
  status: 27,
  summary:'NoAlertOpenError', 
  detail:'An attempt was made to operate on a modal dialog when one was not open.'}
, 28: {
  status: 28,
  summary:'ScriptTimeout', 
  detail:'A script did not complete before its timeout expired.'}
, 29: {
  status: 29,
  summary:'InvalidElementCoordinates', 
  detail:'The coordinates provided to an interactions operation are invalid.'}
, 30: {
  status: 30,
  summary:'IMENotAvailable', 
  detail:'IME was not available.'}
, 31: {
  status: 31,
  summary:'IMEEngineActivationFailed', 
  detail:'An IME engine could not be started.'}
, 32: {
  status: 32,
  summary:'InvalidSelector', 
  detail:'Argument was an invalid selector (e.g. XPath/CSS).'}
}

module.exports = JSONWIRE_ERRORS;
