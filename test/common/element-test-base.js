/*global describe,before,it,after */
var CoffeeScript, Express, async, executeCoffee, should, test, textShouldEqual, wd;

CoffeeScript = require('coffee-script');

should = require('should');

async = require('async');

Express = require('./express').Express;

wd = require('./wd-with-cov');

textShouldEqual = function(browser, element, expected, done) {
  browser.text(element, function(err, res) {
    should.not.exist(err);
    res.should.equal(expected);
    done(null);
  });
};

executeCoffee = function(browser, script) {
  var scriptAsJs;
  scriptAsJs = CoffeeScript.compile(script, {
    bare: 'on'
  });
  return function(done) {
    browser.execute(scriptAsJs, function(err) {
      should.not.exist(err);
      done(null);
    });
  };
};

test = function(remoteWdConfig, desired) {
  var browser, express;
  browser = null;
  express = new Express();
  before(function(done) {
    express.start();
    done(null);
  });
  after(function(done) {
    express.stop();
    done(null);
  });
  describe("wd.remote", function() {
    it("should create browser", function(done) {
      browser = wd.remote(remoteWdConfig);
      if (!process.env.WD_COV) {
        browser.on("status", function(info) {
          return console.log("\u001b[36m%s\u001b[0m", info);
        });
        browser.on("command", function(meth, path) {
          return console.log(" > \u001b[33m%s\u001b[0m: %s", meth, path);
        });
      }
      done(null);
    });
  });
  describe("init", function() {
    it("should initialize browserinit", function(done) {
      this.timeout(45000);
      browser.init(desired, function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });
  describe("get", function() {
    it("should navigate to test page", function(done) {
      this.timeout(15000);
      browser.get("http://127.0.0.1:8181/element-test-page.html", function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });
  describe("element.text", function() {
    it("should retrieve the text", function(done) {
      browser.element("id", "text", function(err, el) {
        should.not.exist(err);
        el.should.have.property("text");
        return el.text(function(err, res) {
          res.should.include("I am some text");
          done(null);
        });
      });
    });
  });
  describe("element.textPresent", function() {
    it("should check if text is present", function(done) {
      browser.element("id", "text", function(err, el) {
        should.not.exist(err);
        el.should.have.property("textPresent");
        return el.textPresent("some text", function(err, present) {
          should.not.exist(err);
          present.should.be.true;
          done(null);
        });
      });
    });
  });
  describe("element.click", function() {
    it("element should be clicked", function(done) {
      browser.elementByCss("#click a", function(err, anchor) {
        should.not.exist(err);
        should.exist(anchor);
        return async.series([
          executeCoffee(browser, 'jQuery ->\n  a = $(\'#click a\')\n  a.click ->\n    a.html \'clicked\'\n    false              '), function(done) {
            return textShouldEqual(browser, anchor, "not clicked", done);
          }, function(done) {
            return anchor.click(function(err) {
              should.not.exist(err);
              done(null);
            });
          }, function(done) {
            return textShouldEqual(browser, anchor, "clicked", done);
          }
        ], function(err) {
          should.not.exist(err);
          done(null);
        });
      });
    });
  });
  describe("element.getTagName", function() {
    it("should get correct tag name", function(done) {
      return async.series([
        function(done) {
          browser.elementByCss("#getTagName input", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.getTagName(function(err, res) {
              should.not.exist(err);
              res.should.equal("input");
              done(null);
            });
          });
        }, function(done) {
          browser.elementByCss("#getTagName a", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.getTagName(function(err, res) {
              should.not.exist(err);
              res.should.equal("a");
              done(null);
            });
          });
        }
      ], function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });
  describe("element.isDisplayed", function() {
    it("should check if elemnt is displayed", function(done) {
      return async.series([
        function(done) {
          browser.elementByCss("#isDisplayed .displayed", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.isDisplayed(function(err, res) {
              should.not.exist(err);
              res.should.be.true;
              done(null);
            });
          });
        }, function(done) {
          browser.elementByCss("#isDisplayed .hidden", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.isDisplayed(function(err, res) {
              should.not.exist(err);
              res.should.be.false;
              done(null);
            });
          });
        }, function(done) {
          browser.elementByCss("#isDisplayed .displayed", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.displayed(function(err, res) {
              should.not.exist(err);
              res.should.be.true;
              done(null);
            });
          });
        }
      ], function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });
  describe("element.getComputedCss", function() {
    it("should retrieve the element computed css", function(done) {
      return async.series([
        function(done) {
          browser.elementByCss("#getComputedCss a", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.getComputedCss('color', function(err, res) {
              should.not.exist(err);
              should.exist(res);
              res.length.should.be.above(0);
              done(null);
            });
          });
        }, function(done) {
          browser.elementByCss("#getComputedCss a", function(err, field) {
            should.not.exist(err);
            should.exist(field);
            return field.getComputedCSS('color', function(err, res) {
              should.not.exist(err);
              should.exist(res);
              res.length.should.be.above(0);
              done(null);
            });
          });
        }
      ], function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });
  describe("element.getAttribute", function() {
    it("should retrieve attribute value", function(done) {
      browser.element("id", "getAttribute", function(err, el) {
        should.not.exist(err);
        el.should.have.property("getAttribute");
        return el.getAttribute("att", function(err, value) {
          should.not.exist(err);
          value.should.equal("42");
          done(null);
        });
      });
    });
  });
  describe("element.getValue", function() {
    it("should retrieve value", function(done) {
      browser.element("id", "getValue", function(err, el) {
        should.not.exist(err);
        el.should.have.property("getValue");
        return el.getValue(function(err, value) {
          should.not.exist(err);
          value.should.equal("value");
          done(null);
        });
      });
    });
  });
  describe("element.sendKeys", function() {
    it("should send keys", function(done) {
      var text;
      text = "keys";
      browser.element("id", "sendKeys", function(err, el) {
        should.not.exist(err);
        el.should.have.property("sendKeys");
        return el.sendKeys(text, function(err) {
          should.not.exist(err);
          return el.getValue(function(err, textReceived) {
            should.not.exist(err);
            textReceived.should.equal(text);
            done(null);
          });
        });
      });
    });
  });
  describe("element.clear", function() {
    it("should clear input field", function(done) {
      browser.element("id", "clear", function(err, el) {
        should.not.exist(err);
        el.should.have.property("clear");
        return el.clear(function(err) {
          should.not.exist(err);
          return el.getValue(function(err, textReceived) {
            should.not.exist(err);
            textReceived.should.equal("");
            done(null);
          });
        });
      });
    });
  });
  describe("quit", function() {
    it("should destroy browser", function(done) {
      browser.quit(function(err) {
        should.not.exist(err);
        done(null);
      });
    });
  });
};

exports.test = test;
