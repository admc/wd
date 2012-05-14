// run in the browser

//parse arguments
var condExpr = arguments[0], timeout = arguments[1], 
poll = arguments[2], cb = arguments[3];

// recursive implementation
waitForConditionImpl = function(conditionExpr, limit, poll, cb) {
  
  // timeout check
  if (Date.now() < limit) {
    // condition check
    res = eval(conditionExpr);
    if (res) {
      // condition ok
      return cb(res);
    } else {        
      // wait for poll and try again
      setTimeout(function() {
        waitForConditionImpl(conditionExpr, limit, poll, cb);
      }, poll);        
    }      
  } else {
    // try one last time
    res = eval(conditionExpr);
    if(err != null) {return cb(err);}
    return cb(res);
  }
};

// calling impl
limit = Date.now() + timeout;  
waitForConditionImpl(condExpr, limit, poll, cb);
