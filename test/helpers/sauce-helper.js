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
      console.log("> job:", sessionId, "marked as " +
        (passed? "pass" : "fail") + "." );
      return;
    });
  });
}

module.exports = {
  jobStatus: jobStatus
};

// Looks like the code below is not needed, leaving it commented for now.

// function jobUpdate(jobId, name, tags, done) {
//   var httpOpts = {
//     url: 'http://' + username + ':' + accessKey + '@saucelabs.com/rest/v1/' + username + '/jobs/' + jobId,
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'text/json'
//     },
//     body: JSON.stringify({
//           name: name,
//           tags: tags,
//           "record-video": false
//         }),
//     jar: false /* disable cookies: avoids CSRF issues */
//   };

//   request(httpOpts, function(err) {
//     if(err)
//       { console.log(err); }
//     else
//       { console.log("> job:", jobId, "updated." ); }
//     done(err);
//   });
// }

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


