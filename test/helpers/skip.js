var Args = require('vargs').Constructor;

GLOBAL.skip = function () {
  var cat = null;
  var patterns = {
    'iphone': 'ios',
    'ipad': 'ios',
    'ios': 'ios',
    'android': 'android'
  };
  _(patterns).each(function(_cat, pattern) {
    var re = new RegExp(pattern, 'i');
    if((env.BROWSER || "").match(re)) {
        cat = _cat;
    }
  }).value();
  var args = new Args(arguments);
  var found = _(args.all).find(function(skipConfig) {
    var re = new RegExp( '^' + skipConfig + '$','i');
    return (env.BROWSER || "").match(re) || (cat||"").match(re);
  });
  if(found) {
    return function(testFunction) {
      return function() {
        if (this.skip) {  // Inside it() test case.
          this.skip();
        } else {  // Inside describe() test group.
          before(function() {
            this.skip();
          });
          testFunction.call(this);
        }
      };
    }
  } else {
    return _.identity;
  }
};
