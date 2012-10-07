express = require 'express'

class Express
  start: ->
    @app = express.createServer()
    @app.use(express.static(__dirname + '/assets'));
    @app.listen 8181
        
  stop: ->
    @app.close()

exports.Express = Express
