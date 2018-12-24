'use strict';
const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');
const stripbom = require('strip-bom');

/**
 * Object containing all the file parsers
 */
module.exports.parser = {
    json: JSON.parse
};

/**
 * Default basepath if none is specified
 * @type {PathLike}
 */
module.exports.basepath = '.';

/**
 * 
 * @param {string} filename - Name of the config files without extension
 * @param {PathLike} [basepath=module.export.basepath] - Path to the directory of the config files
 * @param {string} [encoding=utf8] - Encoding of the config files
 * @returns {Object} Config options parsed from the files
 */
module.exports.parseFilesSync = function(filename, basepath, encoding) {
    encoding = encoding || 'utf8';
    basepath = basepath || module.exports.basepath;
    var config = {};
    fs.readdirSync(basepath).forEach(file => {
        var pathDetails = path.parse(file);
        var parser;
        if (pathDetails.name == filename && (parser = module.exports.parser[pathDetails.ext.substr(1).toLowerCase()])) {
            config = merge(config, parser(stripbom(fs.readFileSync(path.join(basepath, file), encoding))));
        }
    });
    return config;
}

module.exports.parse = module.exports.parseFilesSync;