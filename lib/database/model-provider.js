'use strict';

const assert = require('assert').strict;

const log = require('../../utils/logger').log;
const FileHandlingSchema = require('./file-handling-schema');
const fileErrors = require('../types/errors').File;

function modelProvider(Model, fileBucket){

    // inherit from mongoose's compiled Model
    class FileHandlingModel extends Model {

        save(options, fn){
            return new Promise((resolve, reject) => {
                super.save(options, fn).then(res => {
                    log.debug(`Saved document in collection '${this.collection.name}'. Uploading files.`);
                    if ( this.schema instanceof FileHandlingSchema ){
                        this.schema.handleFiles(res, file => file.uploadTo(this.fileBucket))
                            .then(res => {
                                resolve(res);
                            }, err => {
                                if ( err instanceof fileErrors.EmptyReadStreamError){
                                    log.warn('Ignored `EmptyBufferError`. Resolving to `null`.')
                                    resolve(null);
                                }
                                reject(err);
                            });
                    } else {
                        log.debug('-> Schema is not an instance of `FileHandlingSchema`. Nothing to be done.');
                        resolve(res);
                    }
                }, err => {
                    reject(err);
                });
            });
        }
    }

    FileHandlingModel.prototype.fileBucket = FileHandlingModel.fileBucket = fileBucket;


    return FileHandlingModel;
}

module.exports = modelProvider;
