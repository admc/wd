var current, fs, isFull, jsonDoc, jsonDocs, jsonWireFull, jw_k, jw_v, l, mu, resMapping, t, tag, wd_v, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref;

isFull = process.argv[2] === "full";

fs = require("fs");

mu = require('mu2');

_ = require('underscore');

mu.root = __dirname;

jsonWireFull = JSON.parse(fs.readFileSync('doc/jsonwire-full.json').toString());

jsonDocs = [JSON.parse(fs.readFileSync('tmp/webdriver-dox.json').toString()), JSON.parse(fs.readFileSync('tmp/element-dox.json').toString())];

resMapping = [];

for (jw_k in jsonWireFull) {
  jw_v = jsonWireFull[jw_k];
  current = {
    jsonWire: {
      key: jw_k,
      method: jw_k.split(' ')[0],
      path: jw_k.split(' ')[1],
      url: "http://code.google.com/p/selenium/wiki/JsonWireProtocol#" + (jw_k.replace(/\s/g, '_')),
      desc: jw_v
    },
    wd_doc: []
  };
  for (_i = 0, _len = jsonDocs.length; _i < _len; _i++) {
    jsonDoc = jsonDocs[_i];
    for (_j = 0, _len1 = jsonDoc.length; _j < _len1; _j++) {
      wd_v = jsonDoc[_j];
      if (((function() {
        var _k, _len2, _ref, _results;
        _ref = wd_v.tags;
        _results = [];
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          t = _ref[_k];
          if (t.type === 'jsonWire' && t.string === jw_k) {
            _results.push(t);
          }
        }
        return _results;
      })()).length > 0) {
        (function() {
          var l, order, orderTag, _k, _len2, _ref;
          _ref = wd_v.tags;
          for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
            t = _ref[_k];
            if (t.type === 'docOrder') {
              orderTag = t;
            }
          }
          order = orderTag? parseInt(orderTag.string) : 1000000;
          return current.wd_doc.push({
            'desc': (function() {
              var _l, _len3, _ref1, _results;
              _ref1 = wd_v.description.full.split('\n');
              _results = [];
              for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                l = _ref1[_l];
                if (l !== '') {
                  _results.push({
                    line: l
                  });
                }
              }
              return _results;
            })(),
            'order': order
          });
        })();
      }
    }
  }
  current.wd_doc = _.sortBy(current.wd_doc, function(docItem) {
    return docItem.order;
  });
  if (current.wd_doc.length === 0) {
    current.wd_doc0 = true;
  }
  if (current.wd_doc.length === 1) {
    current.wd_doc1 = current.wd_doc;
  }
  if (current.wd_doc.length > 1) {
    current.wd_docN = current.wd_doc;
  }
  if (isFull || current.wd_doc.length > 0) {
    resMapping.push(current);
  }
}

for (_k = 0, _len2 = jsonDocs.length; _k < _len2; _k++) {
  jsonDoc = jsonDocs[_k];
  for (_l = 0, _len3 = jsonDoc.length; _l < _len3; _l++) {
    wd_v = jsonDoc[_l];
    if (((function() {
      var _len4, _m, _ref, _results;
      _ref = wd_v.tags;
      _results = [];
      for (_m = 0, _len4 = _ref.length; _m < _len4; _m++) {
        t = _ref[_m];
        if (t.type === 'jsonWire') {
          _results.push(t);
        }
      }
      return _results;
    })()).length === 0) {
      current = {
        extra: true,
        wd_doc: []
      };
      current.wd_doc.push({
        'desc': (function() {
          var _len4, _m, _ref, _results;
          _ref = wd_v.description.full.split('\n');
          _results = [];
          for (_m = 0, _len4 = _ref.length; _m < _len4; _m++) {
            l = _ref[_m];
            if (l !== '') {
              _results.push({
                line: l
              });
            }
          }
          return _results;
        })()
      });
      current.wd_doc1 = current.wd_doc;
      resMapping.push(current);
    }
  }
}

for (_m = 0, _len4 = jsonDocs.length; _m < _len4; _m++) {
  jsonDoc = jsonDocs[_m];
  for (_n = 0, _len5 = jsonDoc.length; _n < _len5; _n++) {
    wd_v = jsonDoc[_n];
    _ref = wd_v.tags;
    for (_o = 0, _len6 = _ref.length; _o < _len6; _o++) {
      t = _ref[_o];
      if (!(t.type === 'jsonWire')) {
        continue;
      }
      tag = t.string;
      if (jsonWireFull[tag] == null) {
        current = {
          missing: {
            key: tag
          },
          wd_doc: []
        };
        current.wd_doc.push({
          'desc': (function() {
            var _len7, _p, _ref1, _results;
            _ref1 = wd_v.description.full.split('\n');
            _results = [];
            for (_p = 0, _len7 = _ref1.length; _p < _len7; _p++) {
              l = _ref1[_p];
              if (l !== '') {
                _results.push({
                  line: l
                });
              }
            }
            return _results;
          })()
        });
        current.wd_doc1 = current.wd_doc;
        resMapping.push(current);
      }
    }
  }
}

mu.compileAndRender('mapping-template.htm', {
  mapping: resMapping
}).on('data', function(data) {
  return process.stdout.write(data.toString());
});
