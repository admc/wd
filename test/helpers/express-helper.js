var express = require('express');

function Express(rootDir) {
  this.rootDir = rootDir;
  this.partials = {};
}

Express.prototype.start = function() {
  this.app = express();
  this.app.set('view engine', 'hbs');
  this.app.set('views', this.rootDir + '/views');

  var partials = this.partials;
  this.app.get('/test-page', function(req, res) {
    var content = '';
    if(req.query.p){
      content = partials[req.query.p];
    }
    res.render('test-page', {
      testSuite: req.query.ts,
      testTitle: req.query.p,
      content: content
    });
  });

  this.app.use(express["static"](this.rootDir + '/public'));
  this.server = this.app.listen(env.EXPRESS_PORT);
};

Express.prototype.stop = function() {
  return this.server.close();
};

module.exports = {
  Express: Express
};
