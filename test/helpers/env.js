var env = GLOBAL.env = {};

var S = require('string');

var toBoolean = function(str) {
  return S(str).toBoolean() || S(S(str).toInt()).toBoolean();
};

env.VERBOSE = toBoolean(process.env.VERBOSE);
env.BASE_TIME_UNIT = S(process.env.BASE_TIME_UNIT || 500).toInt();
env.TIMEOUT = S(process.env.TIMEOUT || 60000).toInt();

env.REMOTE_CONFIG = process.env.REMOTE_CONFIG;
env.BROWSER = process.env.BROWSER || 'chrome';
if(env.BROWSER === 'multi') {
    env.BROWSER = 'chrome';
    env.MULTI = true;
}
env.DESIRED = process.env.DESIRED ? JSON.parse(process.env.DESIRED) :
  {browserName: env.BROWSER};

if(env.BROWSER === 'android' || env.BROWSER === 'android_tablet'){
  env.ANDROID = true;
  env.DESIRED = {
    'browserName': 'android',
    'version': '4.0',
    'platform': 'Linux',
    'device-type': 'tablet',
    'device-orientation': 'portrait', // 'landscape'
  };
}

if(env.BROWSER === 'android_phone'){
  env.ANDROID = true;
  env.DESIRED = {
    'browserName': 'android',
    'version': '4.0',
    'platform': 'Linux',
    'device-orientation': 'portrait', // 'landscape'
  };
}

if(env.BROWSER === 'ios' || env.BROWSER === 'ipad'){
  env.IOS = true;
  env.DESIRED = {
    'browserName': 'ipad',
    'version': '6.1',
    'platform': 'OS X 10.8',
    'device-orientation': 'portrait', // 'landscape'
  };
}

if(env.BROWSER === 'iphone'){
  env.IOS = true;
  env.DESIRED = {
    'browserName': 'iphone',
    'version': '6.1',
    'platform': 'OS X 10.8',
    'device-orientation': 'portrait', // 'landscape'
  };
}

env.EXPRESS_PORT = S(process.env.EXPRESS_PORT || 3000).toInt();

env.MIDWAY_ROOT_HOST = '127.0.0.1';

if(env.ANDROID){
  env.MIDWAY_ROOT_HOST = '10.0.2.2';
  env.TIMEOUT = 300000;
}

env.MIDWAY_ROOT_URL = "http://" + env.MIDWAY_ROOT_HOST + ":" + env.EXPRESS_PORT;

env.SAUCE_CONNECT = toBoolean(process.env.SAUCE_CONNECT);
env.SAUCE = toBoolean(process.env.SAUCE) || env.SAUCE_CONNECT;

env.TRAVIS_JOB_ID = process.env.TRAVIS_JOB_ID;
env.TRAVIS_JOB_NUMBER = process.env.TRAVIS_JOB_NUMBER;
env.TRAVIS_BUILD_NUMBER = process.env.TRAVIS_BUILD_NUMBER;

if( env.TRAVIS_JOB_ID ){
  env.TRAVIS = true;
  console.log("Travis environment detected.");
  console.log("TRAVIS_BUILD_NUMBER --> ", env.TRAVIS_BUILD_NUMBER);
  console.log("TRAVIS_JOB_NUMBER --> ", env.TRAVIS_JOB_NUMBER);
  console.log("TRAVIS_JOB_ID --> ", env.TRAVIS_JOB_ID);
}

if(env.SAUCE){
  env.BASE_TIME_UNIT = S(process.env.BASE_TIME_UNIT || 1000).toInt();
  env.TIMEOUT = S(process.env.TIMEOUT || 600000).toInt();

  env.SAUCE_JOB_ID =
    env.TRAVIS_BUILD_NUMBER ||
    process.env.SAUCE_JOB_ID ||
    Math.round(new Date().getTime() / (1000*60));
  env.SAUCE_USERNAME = process.env.SAUCE_USERNAME;
  env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY;
  env.SAUCE_PLATFORM = process.env.SAUCE_PLATFORM || 'Linux';
  env.SAUCE_RECORD_VIDEO = toBoolean(process.env.SAUCE_RECORD_VIDEO);

  if(env.SAUCE_CONNECT){
    env.REMOTE_CONFIG =
      'http://' + env.SAUCE_USERNAME + ':' + env.SAUCE_ACCESS_KEY +
        '@localhost:4445/wd/hub';
  } else {
    env.REMOTE_CONFIG =
      'http://' + env.SAUCE_USERNAME + ':' + env.SAUCE_ACCESS_KEY +
        '@ondemand.saucelabs.com/wd/hub';
  }

  env.DESIRED.platform = env.DESIRED.platform || env.SAUCE_PLATFORM;
  env.DESIRED.build = env.SAUCE_JOB_ID;
  env.DESIRED["record-video"] = env.SAUCE_RECORD_VIDEO;
  env.DESIRED.tags = env.DESIRED.tags || [];
  env.DESIRED.tags.push('wd');
  if(env.TRAVIS_JOB_NUMBER){
    env.DESIRED.tags.push('travis');
    env.DESIRED['tunnel-identifier'] = env.TRAVIS_JOB_NUMBER;
  }

  // special case for window
  if (env.BROWSER === 'explorer') {
    env.DESIRED.browserName = 'internet explorer';
    env.DESIRED.platform = 'Windows 7';
    env.DESIRED.version = '10';
  }
}

if(env.MULTI){
    env.ENV_DESC =  '(' + (env.SAUCE? 'sauce' : 'local') + ', multi)';
} else {
    env.ENV_DESC =  '(' + (env.SAUCE? 'sauce' : 'local') + ', ' +
        (env.DESIRED.browserName || 'default') + ')';
}
