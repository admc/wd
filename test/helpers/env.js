var env = module.exports = {};

function stringEnv(name, _default){
  env[name] = process.env[name] || _default;
}

function jsonEnv(name, _default){
  env[name] = process.env[name]? JSON.parse(process.env[name]) : _default;
}

function booleanEnv(name, _default) {
  if(process.env[name] === undefined) {
    env[name] = _default;
  } else {
    env[name] = process.env[name]? true : false;
  }
}

function intEnv(name, _default) {
  env[name] = process.env[name]? parseInt(process.env[name], 10) : _default;
}

booleanEnv('VERBOSE', false);
intEnv('TIMEOUT_BASE', 500);
intEnv('INIT_TIMEOUT', 60000);

stringEnv('REMOTE_CONFIG', undefined);
stringEnv('BROWSER', 'chrome');
jsonEnv('DESIRED', {browserName: env.BROWSER});

booleanEnv('ANDROID', false);
booleanEnv('IOS', false);

// android config
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

// ipad config
if(env.BROWSER === 'ios' || env.BROWSER === 'ipad'){
  env.IOS = true;
  env.DESIRED = {
    'browserName': 'ipad',
    'version': '6.1',
    'platform': 'OS X 10.8',
    'device-orientation': 'portrait', // 'landscape'
  };
}

// iphone config
if(env.BROWSER === 'iphone'){
  env.IOS = true;
  env.DESIRED = {
    'browserName': 'iphone',
    'version': '6.1',
    'platform': 'OS X 10.8',
    'device-orientation': 'portrait', // 'landscape'
  };
}

intEnv('EXPRESS_PORT', 8181);

stringEnv('MIDWAY_ROOT_HOST', 'localhost');
if(env.ANDROID){
  env.MIDWAY_ROOT_HOST = '10.0.2.2';
  env.INIT_TIMEOUT = 300000;
}

stringEnv('MIDWAY_ROOT_URL', "http://" + env.MIDWAY_ROOT_HOST + ":" + env.EXPRESS_PORT);

booleanEnv('SAUCE_CONNECT', false);
booleanEnv('SAUCE', env.SAUCE_CONNECT);

stringEnv('TRAVIS_JOB_ID', undefined);
stringEnv('TRAVIS_JOB_NUMBER', undefined);

if( env.TRAVIS_JOB_ID ){
  env.TRAVIS = true;
  console.log("Travis environment detected.");
  console.log("TRAVIS_JOB_ID --> ", env.TRAVIS_JOB_ID);
  console.log("TRAVIS_JOB_NUMBER --> ", env.TRAVIS_JOB_NUMBER);
}

if(env.SAUCE){
  env.SAUCE_JOB_ID =
    env.TRAVIS_JOB_NUMBER ||
    process.env.SAUCE_JOB_ID ||
    Math.round(new Date().getTime() / (1000*60));
  stringEnv('SAUCE_USERNAME', '');
  stringEnv('SAUCE_ACCESS_KEY', '');
  stringEnv('SAUCE_PLATFORM', 'LINUX');
  booleanEnv('SAUCE_RECORD_VIDEO', false);

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
}
