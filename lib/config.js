var httpConfig = {
  timeout: undefined,
  retries: 3,
  retryDelay: 15,
  baseUrl: undefined,
  proxy: undefined
};

function _configureHttp(httpConfig, opts) {
  for (var key in opts) {
    switch(key) {
      case 'timeout':
        if(opts[key] === 'default') { opts[key] = undefined; }
      break;
      case 'retries':
        if(opts[key] === 'always') { opts[key] = 0; }
        if(opts[key] === 'never') { opts[key] = -1; }
      break;
    }
    if (key in httpConfig) {
      httpConfig[key] = opts[key];
    }
  }
}

function configureHttp(opts) {
  _configureHttp(httpConfig, opts);
}

module.exports = {
  httpConfig: httpConfig,
  _configureHttp: _configureHttp,
  configureHttp: configureHttp
};
