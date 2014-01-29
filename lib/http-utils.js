var request = require('request'),
    utils = require("./utils");

exports.buildInitUrl =function(baseUrl)
{
  return utils.resolveUrl(baseUrl, 'session');
};

exports.buildJsonCallUrl = function(baseUrl ,sessionID, relPath, absPath){
  var path = ['session'];
  if(sessionID)
    { path.push('/' , sessionID); }
  if(relPath)
    { path.push(relPath); }
  if(absPath)
    { path = [absPath]; }
  path = path.join('');

  return utils.resolveUrl(baseUrl, path);
};

exports.newHttpOpts = function(method, httpConfig) {
  // this._httpConfig
  var opts = {};

  opts.method = method;
  opts.headers = {};

  opts.headers.Connection = 'keep-alive';
  opts.timeout = httpConfig.timeout;

  // we need to check method here to cater for DELETE case
  if(opts.method === 'GET' || opts.method === 'POST'){
    opts.headers.Accept = 'application/json';
  }

  opts.prepareToSend = function(url, data) {
    this.url = url;
    if (opts.method === 'POST') {
      this.headers['Content-Type'] = 'application/json; charset=UTF-8';
      this.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
      this.body = data;
    }
  };
  return opts;
};

var _request = function(httpOpts, httpConfig, emit, cb, attempts) {
  request(httpOpts, function(err, res, data) {
    if(!attempts) { attempts = 1; }
    if( httpConfig.retries >= 0 &&
      (httpConfig.retries === 0 || (attempts -1) <= httpConfig.retries) &&
      err && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
      emit('http', err.code , 'Lost http connection retrying in' + httpConfig.retryDelay + 'ms.', err);
      setTimeout(function() {
        _request(httpOpts, httpConfig, emit, cb, attempts + 1 );
      }, httpConfig.retryDelay);
    } else {
      if(err) {
        emit('http', err.code, 'Unexpected error.' , err);
      }
      cb(err, res, data);
    }
  });
};
exports.request = _request;
