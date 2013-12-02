TEST_DIR = test/common test/unit test/local test/saucelabs test/ghostdriver
BROWSER = $(shell node test/helpers/make-tool env BROWSER)
BROWSER_SKIP = $(shell node test/helpers/make-tool env BROWSER_SKIP)
MULTI = $(shell node test/helpers/make-tool env MULTI)
MOBILE = $(shell node test/helpers/make-tool env MOBILE)
SHORT = $(shell node test/helpers/make-tool env SHORT)

DEFAULT:
	@echo
	@echo '  make test -> run all local tests (start selenium with chromedriver first).'
	@echo '  make test_sauce -> run sauce tests (start sauce connect first).'
	@echo '  make test_mobile_sauce -> run mobile sauce tests (start sauce connect first).'
	@echo '  make test_unit -> run the unit tests'
	@echo '  make test_midway -> run the midway tests (start selenium with chromedriver first).'
	@echo '  make test_midway_mobile -> run the mobile midway tests (seteup ios and android driver first).'
	@echo '  make test_e2e -> run the e2e tests (start selenium with chromedriver first).'
	@echo '  make test_midway_sauce_connect -> run the midway tests using sauce connect.'
	@echo '  make test_midway_mobile_sauce_connect -> run the midway mobile tests using sauce connect.'
	@echo '  make test_e2e_sauce -> run the e2e tests on sauce.'
	@echo '  mapping -> build the mapping (implemented only).'
	@echo '  full_mapping -> build the mapping (full).'
	@echo '  unsupported_mapping -> build the mapping (unsupported).'
	@echo ''
	@echo 'Notes:'
	@echo '  - For midway and e2e test, BROWSER=[chrome|firefox|explorer|multi].'
	@echo '  - To test on sauce, set SAUCE_USERNAME/SAUCE_ACCESS_KEY first'
	@echo ''
	@echo 'Mobile test targets: '
	@echo '  test_ios test_iphone test_ipad'
	@echo '  test_android test_android_phone test_android_tablet'

test:
	BROWSER=multi make test_unit test_midway
	BROWSER=chrome make test_midway test_e2e
	BROWSER=firefox make test_midway test_e2e

test_sauce:
	BROWSER=multi make test_unit test_midway_sauce_connect
	BROWSER=chrome make test_midway_sauce_connect test_e2e_sauce
	BROWSER=firefox make test_midway_sauce_connect test_e2e_sauce

test_unit:
	SAUCE_USERNAME= SAUCE_ACCESS_KEY= ./node_modules/.bin/mocha test/specs/*-specs.js

test_midway:
ifeq ($(MULTI),true)
	./node_modules/.bin/mocha test/midway/*-specs.js -g '@multi'
else ifeq ($(SHORT),true)
	./node_modules/.bin/mocha \
		test/midway/api-*-specs.js \
		test/midway/element-specs.js \
		test/midway/asserters-specs.js \
		-g "@skip-${BROWSER_SKIP}|@multi" -i
else
	./node_modules/.bin/mocha \
		test/midway/*-specs.js -g \
		test/midway/suffixes/*-specs.js \
		-g "@skip-${BROWSER_SKIP}|@multi" -i
endif

test_midway_mobile:
	./node_modules/.bin/mocha \
		test/midway/api-nav-specs.js \
		test/midway/api-el-specs.js \
		test/midway/api-exec-specs.js \
		test/midway/mobile-specs.js \
		-g "@skip-${BROWSER_SKIP}" -i

test_e2e:
	./node_modules/.bin/mocha test/e2e/*-specs.js -g "@skip-${BROWSER_SKIP}|@multi" -i

test_midway_sauce_connect:
	SAUCE_CONNECT=1 SAUCE_JOB_ID=`git rev-parse --short HEAD` make test_midway

test_midway_mobile_sauce_connect:
	SAUCE_CONNECT=1 SAUCE_JOB_ID=`git rev-parse --short HEAD` make test_midway_mobile

# run saucelabs test, configure username/key first
test_e2e_sauce:
	SAUCE=1 SAUCE_JOB_ID=`git rev-parse --short HEAD` make test_e2e

test_mobile_sauce:
	BROWSER=android make test_midway_mobile_sauce_connect
	BROWSER=ios make test_midway_mobile_sauce_connect

test_travis:
ifeq ($(MULTI),true)
	make test_unit
	make test_midway_sauce_connect
else ifeq ($(BROWSER),all_androids)
	BROWSER=android_tablet make test_midway_mobile_sauce_connect
	BROWSER=android_phone make test_midway_mobile_sauce_connect
else ifeq ($(MOBILE),true)
	make test_midway_mobile_sauce_connect
else
	make test_midway_sauce_connect
	make test_e2e_sauce
endif

# ifneq ($(TRAVIS_PULL_REQUEST),false)
# 	@echo 'Skipping Sauce Labs tests as this is a pull request'
# else

test_coverage:
	rm -rf coverage
	./node_modules/.bin/istanbul cover test/coverage/run_tests.js --

_dox:
	@mkdir -p tmp
	@./node_modules/.bin/dox -r < lib/webdriver.js > tmp/webdriver-dox.json
	@./node_modules/.bin/dox -r < lib/element.js > tmp/element-dox.json
	@./node_modules/.bin/dox -r < lib/main.js > tmp/main-dox.json
	@./node_modules/.bin/dox -r < lib/asserters.js > tmp/asserters-dox.json

# build the mapping (implemented only)
mapping: _dox
	@node doc/mapping-builder.js

# build the mapping (full)
full_mapping: _dox
	@node doc/mapping-builder.js full

# build the mapping (unsupported)
unsupported_mapping: _dox
	@node doc/mapping-builder.js unsupported

.PHONY: \
	DEFAULT \
	test \
	test_sauce \
	test_unit \
	test_midway \
	test_e2e \
	test_midway_sauce_connect \
	test_e2e_sauce \
	test_mobile \
	test_ios \
	test_ipad \
	test_iphone \
	test_android \
	test_android_phone \
	test_android_tablet \
	test_travis \
	test_coverage \
	mapping \
	full_mapping \
	unsupported_mapping \
	_dox
