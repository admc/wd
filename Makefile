# run test, start selenium server first 
test: 
	./node_modules/.bin/nodeunit test/unit

# compile once
compile2js:
	./node_modules/coffee-script/bin/coffee --compile test/unit/*.coffee

# compile, and then watch for changes
compile2js_watch:
	./node_modules/coffee-script/bin/coffee --compile --watch test/unit/*.coffee
	  
.PHONY: test compile2js compile2js_watch
  
