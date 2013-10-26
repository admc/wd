var request = require('request');

function jobStatus(passed, sessionId) {
  return Q.fcall(function() {
    if(!env.SAUCE) {return;}
    var httpOpts = {
      url: 'http://' + env.SAUCE_USERNAME + ':' +
        env.SAUCE_ACCESS_KEY + '@saucelabs.com/rest/v1/' +
        env.SAUCE_USERNAME + '/jobs/' + sessionId,
      method: 'PUT',
      headers: {
        'Content-Type': 'text/json'
      },
      body: JSON.stringify({
            passed: passed
          }),
      jar: false /* disable cookies: avoids CSRF issues */
    };

    return Q.nfcall(request, httpOpts).then(function() {
      if(env.VERBOSE){
        console.log("> job:", sessionId, "marked as " +
          (passed? "pass" : "fail") + "." );
      }
    });
  });
}

function jobUpdate(jsonData , sessionId) {
  return Q.fcall(function() {
    if(!env.SAUCE) {return;}
    var httpOpts = {
      url: 'http://' + env.SAUCE_USERNAME + ':' +
        env.SAUCE_ACCESS_KEY + '@saucelabs.com/rest/v1/' +
        env.SAUCE_USERNAME + '/jobs/' + sessionId,
      method: 'PUT',
      headers: {
        'Content-Type': 'text/json'
      },
      body: JSON.stringify(jsonData),
      jar: false /* disable cookies: avoids CSRF issues */
    };

    return Q.nfcall(request, httpOpts).then(function() {
      if(env.VERBOSE){
        console.log("> job:", sessionId, "updated ");
      }
    });
  });
}

module.exports = {
  jobStatus: jobStatus,
  jobUpdate: jobUpdate
};

// Looks like the code below is not needed, leaving it commented for now.

// exports.desiredDefaults = {
//   chrome: {
//     browserName: 'chrome',
//   }
//   , firefox: {
//     browserName: 'firefox',
//     version: '22'
//   }
//   , explorer: {
//     browserName: 'iexplore',
//     version: '9',
//     platform: 'Windows 2008',
//   }
// };


