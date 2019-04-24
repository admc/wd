module.exports = {
  "env": {
    "node": true,
    "browser": true,
    "commonjs": true,
    "es6": true,
    "mocha": true
  },
  "extends": "../.eslintrc.js",
  "globals": {
    "wd": "readonly",
    "env": "readonly",
    "should": "readonly",
    "skip": "readonly",
    "Q": "readonly",
    "prepareJs": "readonly",
    "AssertionError": "readonly"
  }
};
