'use strict';

const chai = require('chai');

chai.should();

const configurationHelper = require('../../configuration/configuration-helper');

describe('.configurationHelper', function(){

    it('should merge snackend\'s default config with the provided options', function(){
        const options = {
            general: {
                name: 'configurator'
            },
            database: {
                name: 'config'
            }
        };

        const mergedConfig = configurationHelper(options);
        mergedConfig.should.have.property('general').eql(Object.assign(
            configurationHelper().general, options.general));
        mergedConfig.should.have.property('database').eql(Object.assign(
            configurationHelper().database, options.database));
        mergedConfig.should.have.property('port').eql(configurationHelper().port);
    });

});