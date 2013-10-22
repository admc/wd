var request = require('request');

var username = process.env.SAUCE_USERNAME || "SAUCE_USERNAME";
var accessKey = process.env.SAUCE_ACCESS_KEY || "SAUCE_ACCESS_KEY";

function configure() {
  if(!process.env.SAUCE) {return;}
  var recordVideo = process.env.SAUCE_RECORD_VIDEO || true;
  recordVideo = recordVideo? true : false;
  var remoteConfig = 'http://' + username + ':' + accessKey + '@ondemand.saucelabs.com/wd/hub';
  var desired = {
    browserName: process.env.BROWSER || 'chrome',
    platform: process.env.PLATFORM || 'LINUX',
    build:  process.env.TRAVIS_JOB_ID ||
            process.env.JOB_ID ||
            Math.round(new Date().getTime() / (1000*60)),
    tags: ['wd'],
    "record-video": recordVideo
  };
  process.env.REMOTE_CONFIG = remoteConfig;
  process.env.DESIRED = JSON.stringify(desired);
  return;
}

function jobStatus(passed, sessionId) {
  return Q.fcall(function() {
    if(!process.env.SAUCE) {return;}
    var httpOpts = {
      url: 'http://' + username + ':' + accessKey + '@saucelabs.com/rest/v1/' + username + '/jobs/' + sessionId,
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
  configure: configure,
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


