'use strict';
const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');
const stripbom = require('strip-bom');

/**
 * Callback for when files have been parsed
 * @callback parseCallback
 * @param {any} error If an error occured the error, otherwise null or undefined
 * @param {object} config The parsed config object
 */

/**
 * Options for parsing config files
 * @typedef {object} ParseOptions
 * @property {string} file File to parse, without file extension
 * @property {string} encoding Encoding to use instead of the default encoding
 */

 /**
  * Class for parsing config files with same name into a single config object
  */
class Configr {

    /**
     * Create a new {@link Configr} object
     * @param {PathLike} [basepath=.] Directory in which config files are searched for
     * @param {string} [encoding=utf8] Default encoding for files
     * @param {object} [parser={ json: JSON.parse }] Parsers for parsing files mapped by their file extensions
     */
    constructor(basepath, encoding, parser) {
        /** Configr class */
        this.Configr = Configr;
        /** @type {PathLike} Base directory for parsing files */
        this.basepath = basepath || ".";
        /** @type {string} Default encoding for parsing files */
        this.encoding = encoding || "utf8";
        /** @type {object} A object with file parsers mapped by the file extension of the files they parse */
        this.parser = parser || { json: JSON.parse };
    }

    /**
     * Search for passed files and return parsed and merged config object
     * @param {(ParseOptions | string)} options If it's type of string it is interpreted as the filename.options
     * @returns {object} Parsed config object
     */
    parseSync(options) {
        // Convert string to ParseOptions
        if (typeof(options) === "string") options = { file: options };

        var filepath = path.join(this.basepath, path.dirname(options.file));
        var filename = path.basename(options.file);

        var config = {};

        // Iterate all files in the given path
        fs.readdirSync(filepath).forEach(function(file) {
            var pathDetails = path.parse(file);
            var parser;

            // If file matches name, try get parser for its file extension
            if (pathDetails.name == filename && (parser = this.parser[pathDetails.ext.substr(1).toLowerCase()])) {
                // Merge current config object with newly parsed one
                config = merge(config, parser(stripbom(fs.readFileSync(path.join(filepath, file), options.encoding || this.encoding || "utf8"))));
            }
        }.bind(this));

        return config;
    }

    /**
     * 
     * @param {(ParseOptions | string)} options If it's type of string it is interpreted as the filename.options
     * @param {parseCallback} callback Callback for when files have been parsed into a config object
     */
    parse(options, callback) {
        // Convert string to ParseOptions
        if (typeof(options) === "string") options = { file: options };

        var filepath = path.join(this.basepath, path.dirname(options.file));
        var filename = path.basename(options.file);

        var config = {};

        fs.readdir(filepath, function(err, files) {
            // If an error occured, return error and stop
            if (err) {
                callback(err);
                return;
            }

            // Because we don't use promises, count active jobs and return if all are done
            var jobs = 1;

            // Iterate all files in the given path
            files.forEach(function(file) {
                var pathDetails = path.parse(file);
                var parser;
    
                // If file matches name, try get parser for its file extension
                if (pathDetails.name == filename && (parser = this.parser[pathDetails.ext.substr(1).toLowerCase()])) {
                    jobs++;
                    fs.readFile(path.join(filepath, file), options.encoding || this.encoding || "utf8", function(err, data) {
                        // If an error occured, return error and stop
                        if (err) {
                            callback(err);
                            return;
                        }
                        // Merge current config object with newly parsed one
                        config = merge(config, parser(stripbom(data)));

                        // Decrement active jobs, if none are active anymore return
                        if (--jobs === 0) {
                            callback(undefined, config);
                        }
                    }.bind(this));
                }
            }.bind(this));

            // Decrement active jobs, if none are active anymore return
            if (--jobs === 0) {
                callback(undefined, config);
            }

        }.bind(this));
    }
}

module.exports = new Configr();