TEST_DIR = test/common test/unit test/saucelabs
TEST_COFFEE_FILES = $(shell find test/common/*.coffee test/unit/*.coffee test/saucelabs/*.coffee)

DEFAULT:
	@echo
	@echo '  make test -> run the unit tests (start selenium with chromedriver first).'
	@echo '  make test_saucelabs -> run the saucelabs tests (configure username/access_key first).'
	@echo '  make compile2js -> compile coffee files to js.'
	@echo '  make compile2js_watch -> compile coffee files to js, watch for changes.'
	@echo '  make cleanGenJs -> clean js files generated from coffeescript.'
	@echo

# run test, start selenium server first
test:
	./node_modules/.bin/nodeunit test/unit/*-test.coffee

# run saucelabs test, configure username/key first
test_saucelabs:
	./node_modules/.bin/nodeunit test/saucelabs/*-test.coffee

# remove all the generated js
cleanGenJs:
	@rm -f test/common/*.js test/unit/*.js test/saucelabs/*.js

# compile once
compile2js:
	@./node_modules/.bin/coffee --compile $(TEST_DIR)
# compile, and then watch for changes
compile2js_watch:
	./node_modules/.bin/coffee --compile --watch $(TEST_DIR)

.PHONY: test compile2js compile2js_watch cleanGenJs DEFAULT
