### Mobile JsonWire Protocol Methods ###

Wd.js is incrementally implementing the Mobile JsonWire Protocol Spec
 - read the [draft](https://code.google.com/p/selenium/source/browse/spec-draft.md?repo=mobile)

#### -ios_automation Locator Strategy ####

Find elements in iOS applications using the [UIAutomation Javascript API](https://developer.apple.com/library/ios/documentation/DeveloperTools/Reference/UIAutomationRef/_index.html)

eg:
```
wd.findElementsByIosUIAutomation('.tableViews()[0].cells()', function(err, el){
  el.findByIosUIAutomation('.elements()["UICatalog"]', function(err, el){
    el.getAttribute('name', function(err, name){
      console.log(name);
    });
  });
});
```
