var gulp = require('gulp'),
    Q = require('q'),
    path = require('path'),
    _ = require('lodash'),
    args = require('yargs').argv,
    urlLib = require('url'),
    mochaStream = require('spawn-mocha-parallel').mochaStream,
    httpProxy = require('http-proxy'),
    sauceConnectLauncher = require('sauce-connect-launcher'),
    async = require('async'),
    log = require('fancy-log'),
    eslint = require('gulp-eslint'),
    gulpIf = require('gulp-if'),
    debug = require('gulp-debug');

require('./test/helpers/env');


var VERBOSE = !!process.env.VERBOSE;

args.browsers = (args.browser || 'chrome').split(',');
args.sauce = args.sauce ? true : false;

var BROWSERS = ['chrome', 'firefox'];
if (args.sauce) { BROWSERS.push('explorer'); }

var MOBILE_BROWSERS = ['android', 'ios', 'iphone', 'ipad', 'android_phone'];

process.env.SAUCE_CONNECT_VERSION = process.env.SAUCE_CONNECT_VERSION || '4.5.1';
process.env.SAUCE_CONNECT_VERBOSE = false;

var PROXY_PORT = 5050;
var expressPort = 3000; // incremented after each test to avoid collision

var debugLog = log.bind(log);
var warnLog = log.warn.bind(log);
var errorLog = log.error.bind(log);

function buildMochaOpts(opts) {
  var mochaOpts = {
    flags: {
      u: 'bdd-with-opts',
      R: 'spec',
      c: true,
    },
    exit: true,
    bin: path.join(__dirname,  'node_modules/.bin/' + ((process.platform !== "win32") ? 'mocha' : 'mocha.cmd')),
    concurrency: args.concurrency | process.env.CONCURRENCY || 3
  };
  if(args.grep) {
    mochaOpts.flags.g = args.grep;
  }
  mochaOpts.env = function() {
    var env = _.clone(process.env);
    if(opts.unit) {
      // unit test
      delete env.SAUCE;
      delete env.SAUCE_USERNAME;
      delete env.SAUCE_ACCESS_KEY;
    } else {
      // midway + e2e tests
      env.BROWSER = opts.browser;
      env.SAUCE = args.sauce;
    }
    if(opts.midway) {
      // local server port
      env.EXPRESS_PORT = expressPort;
      expressPort++;
      if(env.SAUCE) {
        env.MIDWAY_ROOT_URL = 'http://127.0.0.1:' + PROXY_PORT + '/' +
          env.EXPRESS_PORT;
      }
      if(process.env.TRAVIS_JOB_NUMBER) {
        env.TUNNEL_IDENTIFIER  = process.env.TRAVIS_JOB_NUMBER;
      }
    }
    return env;
  };
  return mochaOpts;
}

function runSequence (...args) {
  args = _.flattenDeep(args);
  return Q.Promise(function (resolve) {
    if (args.length === 0) {
      return resolve();
    }
    // do the tasks in series
    (gulp.series(...args, function finishSequence (done) {
      done();
      resolve();
    }))();
  });
}

gulp.task('lint', function() {
  var opts = {
    fix: process.argv.indexOf('--fix') !== -1,
  };
  return gulp.src(['*.js', 'lib/**/*.js', 'test/**/*.js', '!node_modules', '!**/node_modules', '!build/**'])
    .pipe(gulpIf(!!process.env.VERBOSE, debug()))
    .pipe(eslint(opts))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulpIf(function (file) {
      return file.eslint && file.eslint.fixed;
    }, gulp.dest(process.cwd())));
});

gulp.task('test:unit', function () {
  var opts = buildMochaOpts({ unit: true });
  var mocha = mochaStream(opts);
  return gulp.src('test/specs/**/*-specs.js', {read: false})
    .pipe(gulpIf(VERBOSE, debug()))
    .pipe(mocha)
    .on('error', warnLog);
});

gulp.task('test:midway:multi', function () {
  var opts = buildMochaOpts({ midway: true, browser: 'multi' });
  var mocha = mochaStream(opts);
  return gulp.src('test/midway/multi/**/*-specs.js', {
    read: false})
    .pipe(gulpIf(VERBOSE, debug()))
    .pipe(mocha)
    .on('error', warnLog);
});

// create a test:midway: and test:e2e: task for each browser
_(BROWSERS).each(function(browser) {
  gulp.task(`test:midway:${browser}`, function () {
    var opts = buildMochaOpts({ midway: true, browser: browser });
    var mocha = mochaStream(opts);
    return gulp.src([
      'test/midway/**/*-specs.js',
      '!test/midway/multi/**'
    ], {read: false})
      .pipe(gulpIf(VERBOSE, debug()))
      .pipe(mocha)
      .on('error', errorLog);
  });
  gulp.task(`test:e2e:${browser}`, function () {
    var opts = buildMochaOpts({ browser: browser });
    var mocha = mochaStream(opts);
    return gulp.src('test/e2e/**/*-specs.js', {read: false})
      .pipe(gulpIf(VERBOSE, debug()))
      .pipe(mocha)
      .on('error', errorLog);
  });
});

// create a test:midway: task for each mobile browser
_(MOBILE_BROWSERS).each(function (browser) {
  gulp.task(`test:midway:${browser}`, function () {
    var opts = buildMochaOpts({ midway: true, browser: browser });
    return gulp.src([
      'test/midway/api-nav-specs.js',
      'test/midway/api-el-specs.js',
      'test/midway/api-exec-specs.js',
      'test/midway/mobile-specs.js',
    ], {read: false})
    .pipe(gulpIf(VERBOSE, debug()))
    .pipe(mochaStream(opts))
    .on('error', errorLog);
  });
});

gulp.task('test:midway', function() {
  const midwayTestTasks = _.map(args.browsers, (browser) =>`test:midway:${browser}`);
  return runSequence('pre:midway', ...midwayTestTasks)
    .finally(function () {
      return runSequence('post:midway');
    });
});

gulp.task('test:e2e', function() {
  var e2eTestTasks = [];
  _(args.browsers).chain().without('multi').each(function(browser) {
    e2eTestTasks.push(`test:e2e:${browser}`);
  });
  // if (e2eTestTasks.length > 0) {
    return runSequence(e2eTestTasks);
  // }
});

gulp.task('test', function() {
  var seq = ['lint', 'test-unit', 'test-midway-multi'];
  _(BROWSERS).each(function(browser) {
     seq.push(`test:midway:${browser}`, `test:e2e:${browser}`);
  });
  return runSequence.apply(null, seq);
});

var server;
gulp.task('proxy:start', function(done) {
  var proxy = httpProxy.createProxyServer({});
  var proxyQueue;
  var throttle = args.throttle || process.env.THROTTLE;
  if(throttle) {
    proxyQueue = async.queue(function(task, done) {

      proxy.web(task.req, task.res, { target: 'http://127.0.0.1:' + task.port });
      task.res.on('finish', function() {
        done();
      });
    }, parseInt(args.throttle, 10));
  }
  server = require('http').createServer(function(req, res) {
    try {
      if(req.url.match(/^\/favicon/)) {
        res.write("404 Not Found\n");
        res.end();
        return;
      }
      // extracting port from url and rewriting url
      var url = urlLib.parse(req.url);
      var re = /\/(.*?)\//;
      var m = re.exec(url.pathname);
      var port = parseInt(m[1]);
      url.pathname = url.pathname.replace(re, '/');
      req.url = url.format();
      if(throttle) {
        proxyQueue.push({req: req, res: res, port: port});
      } else {
        proxy.web(req, res, { target: 'http://127.0.0.1:' + port });
      }
    } catch (err) {
      try{
        log.error('Proxy error for: ', req.url + ':' , err);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end('Something went wrong.');
      } catch (ign) {}
    }
  });

  server.on('error', function(err) {
    log.error(`Proxy error: ${err}`);
  });

  log("Listening on port", PROXY_PORT);
  server.listen(PROXY_PORT, done);
});

gulp.task('proxy:stop', function(done) {
  // stop proxy, exit after 5 sec if hanging
  done = _.once(done);
  var timeout = setTimeout(function () {
    done();
  }, 5000);
  if (server) {
    server.close(function () {
      clearTimeout(timeout);
      done();
    });
  }
  else {
    done();
  }
});

var sauceConnectProcess = null;

gulp.task('sc:start', function (done) {
  var opts = {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    verbose: process.env.SAUCE_CONNECT_VERBOSE,
    directDomains: 'cdnjs.cloudflare.com,html5shiv.googlecode.com',
    logger: debugLog,
  };
  if (process.env.TRAVIS_JOB_NUMBER) {
    opts.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
  }
  var startTunnel = function (done, n) {
    sauceConnectLauncher(opts, function (err, _sauceConnectProcess) {
      if (err) {
        if (n > 0) {
          log('retrying sauce connect in 20 secs.');
          setTimeout(function () {
            startTunnel(done, n - 1);
          }, 20000);
        } else {
          log.error(err.message);
          done(err);
        }
        return;
      }
      sauceConnectProcess = _sauceConnectProcess;
      log("Sauce Connect ready");
      done();
    });
  };

  startTunnel(done, 3);
});

gulp.task('sc:stop', function (done) {
  if(sauceConnectProcess) {
    sauceConnectProcess.close(done);
  } else {
    done();
  }
});

gulp.task('pre:midway', function() {
  var seq = args.sauce && !args['nosc']
    ? ['sc:start', 'proxy:start']
    : ['proxy:start'];
  return runSequence(seq);
});

gulp.task('post:midway', function () {
  var seq = args.sauce && !args['nosc']
    ? ['sc:stop', 'proxy:stop']
    : ['proxy:stop'];
  return runSequence(seq);
});

gulp.task('travis', function() {
  var seq;
  switch (args.config) {
    case 'unit':
      return runSequence(['test:unit']);
    case 'multi':
      args.browsers= [args.config];
      return runSequence(['test:midway']);
    case 'chrome':
    case 'firefox':
    case 'explorer':
      args.browsers= [args.config];
      return runSequence(['test:midway', 'test:e2e']);
    case 'iphone':
    case 'ipad':
    case 'android_phone':
      args.browsers= [args.config];
      return runSequence(['test:midway']);
    case 'chrome_e2e':
      args.browsers= ['chrome'];
      return runSequence(['test:e2e']);
  }
  return runSequence.apply(null, seq);
});
