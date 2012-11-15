var config, should, request;

should = require('should');
request = require('request');

try {
  config = require('./config');
} catch (err) {

}

should.exist(config, "Missing config!\nYou need to copy config-sample.js to config.js,\nand then configure your sauce username and access-key in\nconfig.js");

var username, accessKey;
if(config.saucelabs) {
  username = config.saucelabs.username;
  accessKey = config.saucelabs.accessKey;
}

exports.getRemoteWdConfig = function() {
  return {
    host: "ondemand.saucelabs.com",
    port: 80,
    username: username,
    accessKey: accessKey
  };
};

exports.jobPassed = function(jobId, done) {
  var httpOpts = {
    url: 'http://' + username + ':' + accessKey + '@saucelabs.com/rest/v1/' + username + '/jobs/' + jobId,
    method: 'PUT',
    headers: {
      'Content-Type': 'text/json'
    },
    body: JSON.stringify({passed: true})
  };

  request(httpOpts, function(err, res) {
    if(err) 
      { console.log(err); }
    else
      { console.log("> job:", jobId, "marked as pass." ); } 
    done(err);
  });
};

