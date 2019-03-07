# configr
A library to parse config files of different formats into a single config object.

## Install

```
npm install ConiCode/configr
```

## Usage
```javascript
const configr = require('configr');
const YAML = require('js-yaml');

// Set up additional parsers, JSON is enabled by default
// Key is the file extension
// Value is a function which get a string parsed and returns an object
configr.parser.yaml = YAML.safeLoad;

// To disable JSON simple remove it from the parsers
// delete configr.parser.json;

// Change default config directory, default is '.'
configr.basepath = './config';

// Parse files with name 'config' (don't specify the file extension!)
let config = configr.parseFileSync('config');

// Parse files in other directory, using UTF-16 LE as their encoding
// All encodings supported by node are valid
let otherConfig = configr.parseFileSync('otherConfig', './config/data', 'utf16le');
```

## TODO
* [ ] Add `parseFile(...)` function for asynchronous parsing
* [ ] Make configr instantiable to have multiple configurations at the same time
