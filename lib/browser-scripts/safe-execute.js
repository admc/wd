var code = arguments[0], args = arguments[1];
var wrap = function() {
  return eval(code);
};
try {
  return wrap.apply(this, args);
} catch (err) {
  throw err;
}
