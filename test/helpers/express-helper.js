var express = require('express');

function Express(rootDir) {
  this.rootDir = rootDir;
  this.partials = {};
}

Express.prototype.start = function() {
  var _this = this;
  this.app = express();
  this.app.set('view engine', 'hbs');
  this.app.set('views', this.rootDir + '/views');

  this.app.get('/test-page', function(req, res) {
    var content = '';
    if(req.query.p){
      content = _this.partials[req.query.p];
      console.log('got page', req.query.p, '-->', content );
    }
    res.render('test-page', {
      testSuite: req.query.ts? req.query.ts.replace(/\@[\w\-]+/g,'') : '',
      testTitle: (req.query.c? req.query.c + ' - ': '') + req.query.p,
      content: content
    });
  });

  this.app.use(express["static"](this.rootDir + '/public'));
  this.server = this.app.listen(env.EXPRESS_PORT);
};

Express.prototype.stop = function() {
  return this.server.close();
};

Express.prototype.addPartial = function(pageKey, page){
  console.log('adding for', pageKey, ' -->', page );
  this.partials[pageKey] = page;
};

module.exports = {
  Express: Express
};
