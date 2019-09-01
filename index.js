const logger = require('./utils/logger');

function snackend(loggerOpts){

    // initializing logger
    this.log = logger.init(loggerOpts);

    const Snackend = require('./lib/snackend');
    loadModules();
    log.debug('snackend\'s modules have been loaded.');
    return Snackend;
}

// Static exports available without initialization
snackend.logger = logger;

// Instance Exports, initialization is required
function loadModules(){
    Object.assign(snackend, require('./lib/'));
}

module.exports = snackend;