var nock = require('nock'),
    async = require('async');
require('../helpers/setup');

describe("mjson tests", function() {

  var server;

  before(function() {
    server = nock('http://localhost:5555');
  });

  describe("promise api", function() {
    var browser;

    before(function(done) {
      server.post('/session').reply(303, "OK", {
        'Location': '/session/1234'
      });
      browser = wd.promiseChainRemote('http://localhost:5555/');
      browser
        .init()
        .nodeify(done);
    });

    describe("by ios uiautomation", function() {

      it("element methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/element', {"using":"-ios uiautomation","value":"random stuff"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          });
        server
          .post('/session/1234/elements', {"using":"-ios uiautomation","value":"random stuff"})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .element('-ios uiautomation', 'random stuff')
            .should.eventually.exist
          .elementByIosUIAutomation('random stuff')
            .should.eventually.exist
          .elementByIosUIAutomationOrNull('random stuff')
            .should.eventually.exist
          .elementByIosUIAutomationIfExists('random stuff')
            .should.eventually.exist
          .hasElementByIosUIAutomation('random stuff')
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("elements methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/elements', {"using":"-ios uiautomation","value":"random stuff"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .elements('-ios uiautomation', 'random stuff')
            .should.eventually.exist
          .elementsByIosUIAutomation('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

      it("wait methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/elements', {"using":"-ios uiautomation","value":"random stuff"})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .waitForElement('-ios uiautomation', 'random stuff')
            .should.eventually.exist
          .waitForElementByIosUIAutomation('random stuff')
            .should.eventually.exist
          .waitForElementsByIosUIAutomation('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

    });

    describe("by android uiautomator", function() {

      it("element methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/element', {"using":"-android uiautomator","value":"random stuff"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          });
        server
          .post('/session/1234/elements', {"using":"-android uiautomator","value":"random stuff"})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .element('-android uiautomator', 'random stuff')
            .should.eventually.exist
          .elementByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .elementByAndroidUIAutomatorOrNull('random stuff')
            .should.eventually.exist
          .elementByAndroidUIAutomatorIfExists('random stuff')
            .should.eventually.exist
          .hasElementByAndroidUIAutomator('random stuff')
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("elements methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/elements', {"using":"-android uiautomator","value":"random stuff"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .elements('-android uiautomator', 'random stuff')
            .should.eventually.exist
          .elementsByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

      it("wait methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/elements', {"using":"-android uiautomator","value":"random stuff"})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .waitForElement('-android uiautomator', 'random stuff')
            .should.eventually.exist
          .waitForElementByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .waitForElementsByAndroidUIAutomator('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

    });

    describe("by accessibility id", function() {

      it("element methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/element', {"using":"accessibility id","value":"random stuff"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          });
        server
          .post('/session/1234/elements', {"using":"accessibility id","value":"random stuff"})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .element('accessibility id', 'random stuff')
            .should.eventually.exist
          .elementByAccessibilityId('random stuff')
            .should.eventually.exist
          .elementByAccessibilityIdOrNull('random stuff')
            .should.eventually.exist
          .elementByAccessibilityIdIfExists('random stuff')
            .should.eventually.exist
          .hasElementByAccessibilityId('random stuff')
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("elements methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/elements', {"using":"accessibility id","value":"random stuff"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .elements('accessibility id', 'random stuff')
            .should.eventually.exist
          .elementsByAccessibilityId('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

      it("wait methods should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/elements', {"using":"accessibility id","value":"random stuff"})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: [{ELEMENT: '0'}],
          });
        browser
          .waitForElement('accessibility id', 'random stuff')
            .should.eventually.exist
          .waitForElementByAccessibilityId('random stuff')
            .should.eventually.exist
          .waitForElementsByAccessibilityId('random stuff')
            .should.eventually.exist
          .nodeify(done);
      });

    });

    describe("actions", function() {

      it("touch actions should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/element', {"using":"id","value":"random"})
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          })
          .post('/session/1234/touch/perform', [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}])
          .times(7)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            // TODO check what the return is like
            value: [{'not sure': '0'}],
          });
        var action = new wd.TouchAction();
        action.tap();
        var el;
        browser
          .elementById('random').then(function(_el) { el=_el; })
          .then(function() { return browser.performTouch(el, action); })
          .then(function() {
            return browser.performTouch(action)
              .should.eventually.be.rejectedWith(/No element defined in gesture/);
          })
          .then(function() { return browser.performTouch(el, action); })
          .then(function() { return browser.performTouchAction(action.applyToElement(el)); })
          .then(function() { return action.applyTo(el).performOn(browser); })
          .then(function() {
            return browser.performTouchAction(action)
              .should.eventually.be.rejectedWith(/No element defined in gesture/);
          })
          .then(function() { return el.performTouch(action); })
          .then(function() { return el.performTouchAction(action); })
          .then(function() {
            var promise = action.performOn(el);
            promise.then.should.exist;
            return promise;
          })
          .then(function() {
            return action.performOn(browser)
              .should.eventually.be.rejectedWith(/No element defined in gesture/);
          })
          .then(function() {
            // now trying with an action not requiring element
            action = new wd.TouchAction();
            action.release();
            nock.cleanAll();
            server
              .post('/session/1234/touch/perform', [{"action":"release","options":{}}])
              .times(4)
              .reply(200, {
                status: 0,
                sessionId: '1234',
                // TODO check what the return is like
                value: [{'not sure': '0'}],
              });
          })
          .then(function() { return browser.performTouch(action); })
          .then(function() { return el.performTouch(action); })
          .then(function() { return action.performOn(browser); })
          .then(function() { return action.performOn(el); })
          .nodeify(done);
      });

      it("multi actions should work", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/element', {"using":"id","value":"random"})
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          })
          .post('/session/1234/touch/multi/perform', {
            "elementId":"0",
            "actions":[
              [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}],
              [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}]
            ]})
          .times(8)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            // TODO check what the return is like
            value: [{'not sure': '0'}],
          });
        var el;
        var a1 = new wd.TouchAction().tap();
        var a2 = new wd.TouchAction().tap();
        var ma = new wd.MultiAction().add(a1, a2);
        browser
          .elementById('random').then(function(_el) { el = _el; })
          .then(function() { return browser.performMultiTouch(el, ma); })
          .then(function() {
            return browser.performMultiTouch(ma)
              .should.eventually.be.rejectedWith(/No element defined in gesture/);
          })
          .then(function() { return browser.performMultiTouchAction(el, ma); })
          .then(function() { return el.performMultiTouch(ma); })
          .then(function() { return el.performMultiTouchAction(ma); })
          .then(function() { return ma.performOn(el); })
          .then(function() {
            return ma.performOn(browser)
              .should.eventually.be.rejectedWith(/No element defined in gesture/);
           })
          .then(function() { return browser.performMultiTouch( ma.applyTo(el) ); })
          .then(function() { return ma.applyToElement(el).performOn(browser); })
          .then(function() {
            // no global setting of element
            ma = new wd.MultiAction().add(a1.applyTo(el), a2.applyTo(el));
            nock.cleanAll();
            server
              .post('/session/1234/touch/multi/perform', {
                "actions":[
                  [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}],
                  [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}]
                ]})
              .times(2)
              .reply(200, {
                status: 0,
                sessionId: '1234',
                // TODO check what the return is like
                value: [{'not sure': '0'}],
              });
          })
          .then(function() { return browser.performMultiTouch(ma); })
          .then(function() { return ma.performOn(browser); })
          .then(function() {
            // now trying with an action not requiring element
            a1 = new wd.TouchAction().release();
            a2 = new wd.TouchAction().release();
            ma = new wd.MultiAction().add(a1, a2);
            nock.cleanAll();
            server
              .post('/session/1234/touch/multi/perform', {
                "actions":[
                  [{"action":"release","options":{}}],
                  [{"action":"release","options":{}}]
                ]})
              .times(2)
              .reply(200, {
                status: 0,
                sessionId: '1234',
                // TODO check what the return is like
                value: [{'not sure': '0'}],
              });
          })
          .then(function() { return browser.performMultiTouch(ma); })
          .then(function() { return ma.performOn(browser); })
          .nodeify(done);
      });
    });

    describe("device methods", function() {

      it("shakeDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/shake', {})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        browser
          .shakeDevice()
          .shake()
          .nodeify(done);
      });

      it("lockDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/lock', {seconds: 3})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        browser
          .lockDevice(3)
          .lock(3)
          .nodeify(done);
      });

      describe("deviceKeyEvent", function() {
        it("keycode only", function(done) {
          nock.cleanAll();
          server
            .post('/session/1234/appium/device/keyevent', {keycode: 3})
            .reply(200, {
              status: 0,
              sessionId: '1234',
            });
          browser
            .deviceKeyEvent(3)
            .nodeify(done);
        });
        it("keycode only + metastate", function(done) {
          nock.cleanAll();
          server
            .post('/session/1234/appium/device/keyevent', {keycode: 3, metastate: "abcd"})
            .reply(200, {
              status: 0,
              sessionId: '1234',
            });
          browser
            .deviceKeyEvent(3, "abcd")
            .nodeify(done);
        });
        it("pressDeviceKey", function(done) {
          nock.cleanAll();
          server
            .post('/session/1234/appium/device/keyevent', {keycode: 3})
            .reply(200, {
              status: 0,
              sessionId: '1234',
            });
          browser
            .pressDeviceKey(3)
            .nodeify(done);
        });
      });

      describe("rotateDevice", function() {
        it("without element", function(done) {
          nock.cleanAll();
          server
            .post('/session/1234/appium/device/rotate',
              {x: 114, y: 198, duration: 5, radius: 3, rotation: 220, touchCount: 2})
            .times(2)
            .reply(200, {
              status: 0,
              sessionId: '1234',
            });
          browser
            .rotateDevice({x: 114, y: 198, duration: 5, radius: 3, rotation: 220, touchCount: 2})
            .rotate({x: 114, y: 198, duration: 5, radius: 3, rotation: 220, touchCount: 2})
            .nodeify(done);
        });
        it("with element", function(done) {
          nock.cleanAll();
          server
            .post('/session/1234/element', {"using":"id","value":"random"})
            .reply(200, {
              status: 0,
              sessionId: '1234',
              value: {ELEMENT: '0'},
            })
            .post('/session/1234/appium/device/rotate',
              {x: 114, y: 198, duration: 5, radius: 3, rotation: 220, touchCount: 2, element: "0"})
            .times(3)
            .reply(200, {
              status: 0,
              sessionId: '1234',
            });
          browser
            .elementById('random').then(function(el) {
              return browser
                .rotateDevice(el, {x: 114, y: 198, duration: 5, radius: 3,
                  rotation: 220, touchCount: 2})
                .rotate(el, {x: 114, y: 198, duration: 5, radius: 3,
                  rotation: 220, touchCount: 2})
                .then(function() {
                  return el
                    .rotate({x: 114, y: 198, duration: 5, radius: 3,
                      rotation: 220, touchCount: 2});
                });
            })
            .nodeify(done);
        });
      });

      it("getCurrentDeviceActivity", function(done) {
        nock.cleanAll();
        server
          .get('/session/1234/appium/device/current_activity')
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: '.activities.PeopleActivity'
          });
        browser
          .getCurrentDeviceActivity()
          .should.become('.activities.PeopleActivity')
          .getCurrentActivity()
          .should.become('.activities.PeopleActivity')
          .nodeify(done);
      });

      it("installAppOnDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/install_app', {appPath: "http://appium.s3.amazonaws.com/UICatalog6.0.app.zip"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        browser
          .installAppOnDevice("http://appium.s3.amazonaws.com/UICatalog6.0.app.zip")
          .installApp("http://appium.s3.amazonaws.com/UICatalog6.0.app.zip")
          .nodeify(done);
      });

      it("removeAppFromDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/remove_app', {appId: "rubish"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        browser
          .removeAppFromDevice("rubish")
          .removeApp("rubish")
          .nodeify(done);
      });

      it("isAppInstalledOnDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/app_installed', {bundleId: "coolApp"})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: true // TODO check return
          });
        browser
          .isAppInstalledOnDevice("coolApp")
            .should.eventually.be.ok
          .isAppInstalled("coolApp")
            .should.eventually.be.ok
          .nodeify(done);
      });

      it("hideDeviceKeyboard", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/hide_keyboard', {keyName: "Done"})
          .times(1)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        server
          .post('/session/1234/appium/device/hide_keyboard')
          .times(1)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        browser
          .hideKeyboard()
          .hideDeviceKeyboard("Done")
          .nodeify(done);
      });

      it("pushFileToDevice", function(done) {
        var remotePath = '/data/local/tmp/remote.txt';
        var stringData = "random string data " + Math.random();
        var base64Data = new Buffer(stringData).toString('base64');
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/push_file', {path: remotePath, data: base64Data})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
          });
        browser
          .pushFileToDevice(remotePath, base64Data)
          .pushFile(remotePath, base64Data)
          .nodeify(done);
      });

      it("pullFileFromDevice", function(done) {
        var remotePath = '/data/local/tmp/remote.txt';
        var stringData = "random string data " + Math.random();
        var base64Data = new Buffer(stringData).toString('base64');
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/pull_file', {path: remotePath})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: base64Data // TODO: check function return
          });
        browser
          .pullFileFromDevice(remotePath, base64Data)
            .should.become(base64Data)
          .pullFile(remotePath, base64Data)
            .should.become(base64Data)
          .nodeify(done);
      });

      it("toggleAirplaneModeOnDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/toggle_airplane_mode', {})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .toggleAirplaneModeOnDevice()
          .toggleAirplaneMode()
          .toggleFlightMode()
          .nodeify(done);
      });

      it("toggleWiFiOnDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/toggle_wifi', {})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .toggleWiFiOnDevice()
          .toggleWiFi()
          .nodeify(done);
      });

      it("toggleLocationServicesOnDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/toggle_location_services', {})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .toggleLocationServicesOnDevice()
          .toggleLocationServices()
          .nodeify(done);
      });

      it("toggleDataOnDevice", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/toggle_data', {})
          .times(2)
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .toggleDataOnDevice()
          .toggleData()
          .nodeify(done);
      });

      it("launchApp", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/app/launch', {})
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .launchApp()
          .nodeify(done);
      });

      it("closeApp", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/app/close', {})
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .closeApp()
          .nodeify(done);
      });

      it("resetApp", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/app/reset', {})
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .resetApp()
          .nodeify(done);
      });

      it("backgroundApp", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/app/background', {seconds: 3})
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .backgroundApp(3)
          .nodeify(done);
      });

      it("endTestCoverageForApp", function(done) {
        var intent = "android.intent.action.BOOT_COMPLETED";
        var path = "/random/path";
        var stringData = "random string data " + Math.random();
        var base64Data = new Buffer(stringData).toString('base64');
        nock.cleanAll();
        server
          .post('/session/1234/appium/app/end_test_coverage', {intent: intent, path: path})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: base64Data
          });
        browser
          .endTestCoverageForApp(intent, path)
          .endTestCoverage(intent, path)
          .endCoverage(intent, path)
          .should.become(base64Data)
          .nodeify(done);
      });

      describe("complexFindInApp", function() {
        it("one element", function(done) {
          var selector = "abcd";
          nock.cleanAll();
          server
            .post('/session/1234/appium/app/complex_find', {selector: "abcd"})
            .times(2)
            .reply(200, {
              status: 0,
              sessionId: '1234',
              value: {ELEMENT: '0'}
            });
          browser
            .complexFindInApp(selector)
              .then(function(el) {
                el.value.should.equal('0');
              })
            .complexFind(selector)
              .then(function(el) {
                el.value.should.equal('0');
              }).nodeify(done);
        });
        it("element array", function(done) {
          var selector = "all";
          nock.cleanAll();
          server
            .post('/session/1234/appium/app/complex_find', {selector: "all"})
            .times(2)
            .reply(200, {
              status: 0,
              sessionId: '1234',
              value: [{ELEMENT: '0'}]
            });
          browser
            .complexFindInApp(selector)
              .then(function(els) {
                els[0].value.should.equal('0');
              })
            .complexFind(selector)
              .then(function(els) {
                els[0].value.should.equal('0');
              }).nodeify(done);
        });
      });

      it("getAppStrings", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/app/strings', {language: 'en'})
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: 'abcdefghj'
          });
        browser
          .getAppStrings('en')
          .nodeify(done);
      });

      it("setImmediateValueInApp", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/element', {"using":"id","value":"random"})
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          })
          .post('/session/1234/appium/element/0/value', {value: "12345"})
          .times(4)
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .elementById("random")
          .then(function(el) {
            return browser
              .setImmediateValueInApp(el, "12345")
              .setImmediateValue(el, "12345")
              .then(function() {
                return el
                  .setImmediateValueInApp("12345")
                  .setImmediateValue("12345");
              });
          })
          .nodeify(done);
      });

      it("setNetworkConnection", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/network_connection', {parameters: {type: 5}})
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: 5
          });
        browser
          .setNetworkConnection(5)
            .should.eventually.equal(5)
          .nodeify(done);
      });

      it("getNetworkConnection", function(done) {
        nock.cleanAll();
        server
          .get('/session/1234/network_connection')
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {value: 5}
          });
        browser
          .getNetworkConnection()
            .should.eventually.deep.equal({value: 5})
          .nodeify(done);
      });

      it("openNotifications", function(done) {
        nock.cleanAll();
        server
          .post('/session/1234/appium/device/open_notifications')
          .reply(200, {
            status: 0,
            sessionId: '1234'
          });
        browser
          .openNotifications()
          .nodeify(done);
      });
    });
  });

  describe("async callback api", function() {
    var browser;
    before(function(done) {
      server.post('/session').reply(303, "OK", {
        'Location': '/session/1234'
      });
      browser = wd.remote('http://localhost:5555/');
      browser.init(done);
    });

    it("touch actions should work", function(done) {
      nock.cleanAll();
      server
        .post('/session/1234/element', {"using":"id","value":"random"})
        .reply(200, {
          status: 0,
          sessionId: '1234',
          value: {ELEMENT: '0'},
        })
        .post('/session/1234/touch/perform', [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}])
        .times(3)
        .reply(200, {
          status: 0,
          sessionId: '1234',
          // TODO check what the return is like
          value: [{'not sure': '0'}],
        });
      var el;
      var action = new wd.TouchAction(el).tap();
      async.series([
        function(done) {
          browser.elementById('random', function(err, _el) {
            should.not.exist(err);
            el = _el;
            done();
          });
        },
        function(done) {
          browser.performTouch(el, action, function(err, res) {
            should.not.exist(err);
            res.should.exist;
            done();
          });
        },
        function(done) {
          el.performTouch(action, function(err, res) {
            should.not.exist(err);
            res.should.exist;
            done();
          });
        },
        function(done) {
          action.performOn(el, function(err, res) {
            should.not.exist(err);
            res.should.exist;
            done();
          });
        }
      ], done);
    });

    it("multi actions should work", function(done) {
        server
          .post('/session/1234/element', {"using":"id","value":"random"})
          .reply(200, {
            status: 0,
            sessionId: '1234',
            value: {ELEMENT: '0'},
          })
          .post('/session/1234/touch/multi/perform', {
            "elementId":"0",
            "actions":[
              [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}],
              [{"action":"tap","options":{"element":"0","x":null,"y":null,"count":null}}]
            ]})
          .times(3)
          .reply(200, {
            status: 0,
            sessionId: '1234',
            // TODO check what the return is like
            value: [{'not sure': '0'}],
          });
      var el;
      var a1 = new wd.TouchAction(el).tap();
      var a2 = new wd.TouchAction(el).tap();
      var ma = new wd.MultiAction(el).add(a1, a2);
      async.series([
        function(done) {
          browser.elementById('random', function(err, _el) {
            should.not.exist(err);
            el = _el;
            done();
          });
        },
        function(done) {
          browser.performMultiTouch(el, ma, function(err, res) {
            should.not.exist(err);
            res.should.exist;
            done();
          });
        },
        function(done) {
          el.performMultiTouch(ma, function(err, res) {
            should.not.exist(err);
            res.should.exist;
            done();
          });
        },
        function(done) {
          ma.performOn(el, function(err, res) {
            should.not.exist(err);
            res.should.exist;
            done();
          });
        },
      ], done);

    });

  });
});
