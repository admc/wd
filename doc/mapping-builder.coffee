isFull = process.argv[2] is "full"

fs = require "fs"
mu = require 'mu2'

mu.root = __dirname

jsonWireFull = JSON.parse fs.readFileSync('doc/jsonwire-full.json').toString()
webdriverDoc = JSON.parse fs.readFileSync('doc/webdriver-doc.json').toString()
resMapping = []

# main mapping
for jw_k, jw_v of jsonWireFull  
  current =
    jsonWire: 
      key: jw_k
      method: jw_k.split(' ')[0]
      path: jw_k.split(' ')[1]
      url: "http://code.google.com/p/selenium/wiki/JsonWireProtocol##{jw_k.replace(/\s/g, '_')}"
      desc: jw_v
    wd_doc: []
  for wd_v in webdriverDoc
    if (t for t in wd_v.tags when t.type is 'jsonWire' and t.string is jw_k).length > 0       
      current.wd_doc.push
        'desc': ({line: l} for l in (wd_v.description.full.split '\n') when l isnt '')
  current.wd_doc0 = true if current.wd_doc.length is 0 
  current.wd_doc1 = current.wd_doc if current.wd_doc.length is 1 
  current.wd_docN = current.wd_doc if current.wd_doc.length > 1 
  resMapping.push current if isFull or current.wd_doc.length > 0 

# extra section
for wd_v in webdriverDoc
  if (t for t in wd_v.tags when t.type is 'jsonWire').length is 0
    current = 
      extra: true
      wd_doc: []
    current.wd_doc.push
      'desc': ({line: l} for l in (wd_v.description.full.split '\n') when l isnt '')
    current.wd_doc1 = current.wd_doc
    resMapping.push current 

# missing section, looking for errors
for wd_v in webdriverDoc
  for t in wd_v.tags when t.type is 'jsonWire'
    tag = t.string
    unless jsonWireFull[tag]?
      current = 
        missing: 
          key:tag
        wd_doc: []
      current.wd_doc.push
        'desc': ({line: l} for l in (wd_v.description.full.split '\n') when l isnt '')
      current.wd_doc1 = current.wd_doc
      resMapping.push current 
      
mu.compileAndRender( 'mapping-template.htm', {mapping: resMapping})
  .on 'data', (data) ->
    process.stdout.write data.toString()
