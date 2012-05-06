 
test: 
	./node_modules/.bin/nodeunit test/unit

compile2js:
	./node_modules/coffee-script/bin/coffee --compile test/unit/*.coffee
	  
.PHONY: test compile2js
  
