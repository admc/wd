var isTravis = function () {
  return process.env.TRAVIS_JOB_ID;
};

var browsers = [];

// temporalily disabling firefox driver
// because there are issues with latest Selenium
// browsers.push('firefox')

if(!isTravis()){
  browsers.push('chrome');
}

exports.isTravis = isTravis;
exports.browsers = browsers;
