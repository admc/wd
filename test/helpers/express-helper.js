var express = require('express');
var http = require('http');

function Express(rootDir, partials) {
  console.log('Express constructor', 'partials -->', partials );
  this.rootDir = rootDir;
  this.partials = partials;
}

Express.prototype.start = function(done) {
  var _this = this;
  this.app = express();
  this.app.set('view engine', 'hbs');
  this.app.set('views', this.rootDir + '/views');

  this.app.get('/test-page', function(req, res) {
    var content = '';
    if(req.query.p){
      content = _this.partials[req.query.p];
      console.log('Express get test-page', 'partials -->', _this.partials );
      console.log('got page', req.query.p, '-->', content );
    }
    res.render('test-page', {
      testSuite: req.query.ts? req.query.ts.replace(/\@[\w\-]+/g,'') : '',
      testTitle: (req.query.c? req.query.c + ' - ': '') + req.query.p,
      content: content
    });
  });

  this.app.use(express["static"](this.rootDir + '/public'));
  this.server = http.createServer(this.app);
  this.server.listen(env.EXPRESS_PORT, function(err) {
    if(err) { return done(err); }
    console.log('http server was started');
    done();
  });
};

Express.prototype.stop = function(done) {
  this.server.close(function(err) {
    if(err) { return done(err); }
    console.log('http server was stopped');
    done();
  });
};

module.exports = {
  Express: Express
};
