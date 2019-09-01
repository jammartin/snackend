'use strict';

const { createLogger, transports, format }  = require('winston');

const readable = require('./object-helpers').readable;
const configurationHelper = require('../configuration/configuration-helper');

// configuration for the default logger
const defaults = {
    level: 'info',
    transports: [
        new transports.Console()
    ],
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.padLevels(),
        format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
    ),
    exitOnError: false
};


// "Singleton" as container for the logger instance
class Logger{
    constructor(){
        this.format = format;
    }

    init(options){
        if ( this._log !== undefined) {
            this._log.warn(`Attempting to re-initialize \`Logger\`.`
                + `Options ${readable(options)} are ignored and nothing is done.`);
        } else {
            const config = configurationHelper(options, defaults, ['format']);
            this._log = createLogger(config);
            this._log.debug(`Logger has been initialized.`);
        }
        return this._log;
    }

    get log(){
        return this._log === undefined ? this.init() : this._log;
    }
}

module.exports = new Logger();