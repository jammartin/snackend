'use strict';

const snDefaults = {
    port: 3000,
    general: {
        name: 'snackend'
    },
    database: {
        dbName: 'snackend',
        mongoDbHost: 'mongodb://localhost:27017'
    }
};

function configurationHelper(options, defaults, endRecursionFor){
    endRecursionFor = endRecursionFor || [];
    defaults = defaults || snDefaults;
    const optsMerger = (opts, config) => {
        Object.keys(opts).forEach( key => {
            if ( typeof opts[key] === 'object'
                && !endRecursionFor.includes(key) ){
                config[key] = optsMerger(opts[key], config[key]);
            } else {
                config[key] = opts[key];
            }
        });
        return config;
    };
    return options === undefined ? defaults : optsMerger(options, defaults);
}

module.exports = configurationHelper;