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

stringEnv('REMOTE_CONFIG', undefined);
stringEnv('BROWSER', 'chrome');
jsonEnv('DESIRED', {browserName: env.BROWSER});

console.log("env.DESIRED-->", env.DESIRED);

intEnv('EXPRESS_PORT', 8181);

if(process.env.SAUCE){
  stringEnv('SAUCE_JOB_ID', process.env.TRAVIS_JOB_ID || Math.round(new Date().getTime() / (1000*60)));
  booleanEnv('SAUCE', false);
  stringEnv('SAUCE_USERNAME', '');
  stringEnv('SAUCE_ACCESS_KEY', '');
  stringEnv('SAUCE_PLATFORM', 'LINUX');
  booleanEnv('SAUCE_RECORD_VIDEO', true);

  env.REMOTE_CONFIG =
    'http://' + env.SAUCE_USERNAME + ':' + env.SAUCE_ACCESS_KEY +
      '@ondemand.saucelabs.com/wd/hub';
  env.DESIRED = {
    browserName: env.BROWSER,
    platform: env.SAUCE_PLATFORM,
    build:  env.SAUCE_JOB_ID,
    "record-video": env.SAUCE_RECORD_VIDEO,
    tags: ['wd']
  };
}
