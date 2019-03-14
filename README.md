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
let config = configr.parseSync('config');

// Parse files in data subdirectory, using UTF-16 LE as their encoding
// All encodings supported by node are valid
let otherConfig = configr.parseSync({ file: 'data/otherConfig', encoding: 'utf16le' });


// Parse async
configr.parse('config', function(err, data) {
    if (err) {
        console.error(error)
    } else {
        // Do stuff ...
    }
});


// You can create a new configr options with different settings than the global one
// It behaves exaclty the same as the global object
let modelConfig = new configr.Configr('./models');


// If you want to use promises instead of callbacks you can use Node.js's promisify
let parsePromise = util.promisify(configr.parse.bind(configr));  // Don't forget to bind correct this parameter

// You can also add it to the prototype
configr.Configr.prototype.parsePromise = util.promisify(configr.Configr.prototype.parse);
// Or overwrite it to use it inplace
configr.Configr.prototype.parse = util.promisify(configr.Configr.prototype.parse);

// Now every configr object uses promises
modelConfig.parse('user').then(function(userConfig) {
    // Do stuff ...
});
```
### Methods
* new Configr(basedir: string = '.', encoding: string = 'utf8', parser: object = { json: JSON.parse })
* parseSync(file: { file: string, encoding: string } | string): object
* parse(file: { file: string, encoding: string } | string, callback(err: any, config: object))

## TODO
* [x] Add `parse(...)` function for asynchronous parsing
* [x] Make configr instantiable to have multiple configurations at the same time
* [ ] Add schema validation
