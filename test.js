'use strict';
const assert = require('assert');
const configr = require('./');
const equal = require('fast-deep-equal');
const YAML = require('js-yaml');
const fs = require('fs');
const merge = require('deepmerge');
const stripbom = require('strip-bom');
const util = require('util');

describe('Configr', function() {
    it('should be instantiable', function() {
        new configr.Configr();
    });
});

describe('parseSync', function() {
    configr.basepath = './test';

    it('should parse empty files', function() {
        assert(equal(
            configr.parseSync({ file: 'empty', encoding: 'utf8' }),
            JSON.parse(fs.readFileSync('./test/empty.json'))
        ));
    });

    it('should accept other encodings', function() {
        assert(equal(
            configr.parseSync({ file: 'utf16le', encoding: 'utf16le' }),
            JSON.parse(stripbom(fs.readFileSync('./test/utf16le.json', 'utf16le')))
        ));
    });

    it('should accept other parsers', function() {
        configr.parser.yaml = YAML.safeLoad;
        assert(equal(
            configr.parseSync({ file: 'yaml', encoding: 'utf8' }),
            YAML.safeLoad(fs.readFileSync('./test/yaml.yaml'))
        ));
    });

    it('should merge configs with the same name but different format', function() {
        assert(equal(
            configr.parseSync({ file: 'merge', encoding: 'utf8' }),
            merge(
                YAML.safeLoad(fs.readFileSync('./test/merge.yaml')),
                JSON.parse(fs.readFileSync('./test/merge.json'))
            )
        ));
    });

    it('should default to utf8 if not provided and handle paths as filename', function() {
        assert(equal(
            configr.parseSync('sub/test'),
            JSON.parse(fs.readFileSync('./test/sub/test.json'))
        ));
    });
});

describe('parse', function() {
    configr.basepath = './test';

    it('should parse empty files', function(done) {
        configr.parse({ file: 'empty', encoding: 'utf8' }, function(err, config) {
            if (err) {
                done(err);
                return
            }

            if(equal(
                config,
                JSON.parse(fs.readFileSync('./test/empty.json'))
            )) {
                done();
            } else {
                done(new Error("Parsed objects are not equal"));
            }
        });
    });

    it('should accept other encodings', function(done) {
        configr.parse({ file: 'utf16le', encoding: 'utf16le' }, function (err, config) {
            if (err) {
                done(err);
                return;
            }

            if(equal(config, JSON.parse(stripbom(fs.readFileSync('./test/utf16le.json', 'utf16le'))))) {
                done();
            } else {
                done(new Error("Parsed objects are not equal"));
            }
        });
    });

    it('should accept other parsers', function(done) {
        configr.parser.yaml = YAML.safeLoad;

        configr.parse({ file: 'yaml', encoding: 'utf8' }, function (err, config) {
            if (err) {
                done(err);
                return;
            }
            
            if(equal(config, YAML.safeLoad(fs.readFileSync('./test/yaml.yaml')))) {
                done();
            } else {
                done(new Error("Parsed objects are not equal"));
            }
        });
    });

    it('should merge configs with the same name but different format', function(done) {
        configr.parse({ file: 'merge', encoding: 'utf8' }, function (err, config) {
            if (err) {
                done(err);
                return;
            }

            if(equal(config, merge(
                YAML.safeLoad(fs.readFileSync('./test/merge.yaml')),
                JSON.parse(fs.readFileSync('./test/merge.json'))
            ))) {
                done();
            } else {
                done(new Error("Parsed objects are not equal"));
            }
        });
    });

    it('should default to utf8 if not provided and handle paths as filename', function(done) {
        configr.parse('sub/test', function (err, config) {
            if (err) {
                done(err);
                return;
            }

            if(equal(config, JSON.parse(fs.readFileSync('./test/sub/test.json')))){
                done();
            } else {
                done(new Error("Parsed objects are not equal"));
            }
        });
    });

    it('should work with promisify', function() {
        var parsePromise = util.promisify(configr.parse.bind(configr));
        return parsePromise('sub/test').then(function (config) {
            if (!equal(config, JSON.parse(fs.readFileSync('./test/sub/test.json')))) {
                throw new Error("Parsed objects are not equal");
            }
        });
    });

    it('should work with promisify in prototype', function() {
        configr.Configr.prototype.parse = util.promisify(configr.Configr.prototype.parse);
        return configr.parse('sub/test').then(function (config) {
            if (!equal(config, JSON.parse(fs.readFileSync('./test/sub/test.json')))) {
                throw new Error("Parsed objects are not equal");
            }
        });
    });
});