#!/usr/bin/env node

var net = require('net')
  , repl = require('repl')
  , assert = require('assert')
  , wd = require('./main');

var connections = 0; // eslint-disable-line no-unused-vars

var startRepl = function() {
  var r = repl.start('(wd): ');
  r.context.assert = assert;
  r.context.wd = wd;
  r.context.help = function() {
    console.log("WD - Shell."); // eslint-disable-line no-console
    console.log("Access the webdriver object via the object: 'wd'"); // eslint-disable-line no-console
  };

  var server = net.createServer(function (socket) {
    connections += 1;
    socket.setTimeout(5*60*1000, function() {
      socket.destroy();
    });
    repl.start("(wd): ", socket);
  }).listen(process.platform === "win32" ?
    "\\\\.\\pipe\\node-repl-sock-" + process.pid :
    "/tmp/node-repl-sock-" + process.pid);

  r.on('exit', function () {
    server.close();
    process.exit();
  });
};

if (process.argv[2] === "shell") {
  startRepl();
}
