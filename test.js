'use strict';
const assert = require('assert');
const configr = require('./');
const equal = require('fast-deep-equal');
const YAML = require('js-yaml');
const fs = require('fs');
const merge = require('deepmerge');
const stripbom = require('strip-bom');

describe('parseFiles', function() {
    it('should parse empty files', function() {
        assert(equal(
            configr.parseFilesSync('empty', './test', 'utf8'),
            JSON.parse(fs.readFileSync('./test/empty.json'))
        ));
    });

    it('should return an empty object if no name or nothing is passed', function() {
        assert(equal(configr.parseFilesSync(), {}));
        assert(equal(configr.parseFilesSync(undefined, './test', 'utf8'), {}));
    });

    it('should accept other encodings', function() {
        assert(equal(
            configr.parseFilesSync('utf16le', './test', 'utf16le'),
            JSON.parse(stripbom(fs.readFileSync('./test/utf16le.json', 'utf16le')))
        ));
    });

    it('should accept other parsers', function() {
        configr.parser.yaml = YAML.safeLoad;
        assert(equal(
            configr.parseFilesSync('yaml', './test', 'utf8'),
            YAML.safeLoad(fs.readFileSync('./test/yaml.yaml'))
        ));
    });

    it('should merge configs with the same name but different format', function() {
        assert(equal(
            configr.parseFilesSync('merge', './test', 'utf8'),
            merge(
                YAML.safeLoad(fs.readFileSync('./test/merge.yaml')),
                JSON.parse(fs.readFileSync('./test/merge.json'))
            )
        ));
    });

    it('should default to basepath and utf8 if not provided', function() {
        configr.basepath = "./test/sub";
        assert(equal(
            configr.parseFilesSync('test'),
            JSON.parse(fs.readFileSync('./test/sub/test.json'))
        ));
    });
});