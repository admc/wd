var devices = {};
devices.android = ['android_phone', 'android_tablet'];
devices.ios = ['iphone', 'ipad'];

var desireds = {
  selenium: {},
  appium: {}
};

desireds.selenium.android_phone = {
  'browserName': 'android',
  'version': '4.0',
  'platform': 'Linux',
  'device-orientation': 'portrait', // 'landscape'
};

desireds.selenium.android_tablet = _.merge(_.clone(desireds.selenium.android_phone), {'device-type': 'tablet'});

desireds.selenium.iphone = {
  'browserName': 'iphone',
  'version': '6.1',
  'platform': 'OS X 10.8',
  'device-orientation': 'portrait', // 'landscape'
};

desireds.selenium.ipad = _.merge(_.clone(desireds.selenium.iphone), {'browserName': 'ipad'});

desireds.appium.android_phone = {
  browserName: '',
  platform: 'Linux',
  version: '4.2',
  'device-orientation': 'portrait',
  app: 'chrome',
  'app-package': 'com.android.chrome',
  device: 'Android'
};

desireds.appium.android_tablet = _.merge(_.clone(desireds.appium.android_phone), {'device-type': 'tablet'});

desireds.appium.iphone = {
      browserName: '',
      platform: 'OS X 10.8',
      version: '6',
      'device-orientation': 'portrait',
      app: 'safari',
      device: 'iPhone Simulator'
};

desireds.appium.ipad = _.merge(_.clone(desireds.appium.iphone), {device: 'iPad Simulator'});

env.APPIUM = process.env.APPIUM;

var cat, device;
_(devices).each(function(_devices, _cat) {
  if(env.BROWSER === _cat){
    device = _devices[0];
    cat = _cat;
  }
  else {
    _(_devices).each(function(_device) {
      if(env.BROWSER === _device) {
        device = _device;
        cat = _cat;
      }
    });
  }
});

if(device){
  env.BROWSER_SKIP = cat;
  env[cat.toUpperCase()] = true;
  env.MOBILE = true;
  env.DESIRED = env.APPIUM? desireds.appium[device] : desireds.selenium[device];
}
