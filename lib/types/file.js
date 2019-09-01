'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const stream = require('stream');

const log = require('../../utils/logger').log;
const fileErrors = require('../types/errors').File;

//TODO: implement types

class File extends ObjectId {

    constructor(name, readStream, id){
        // TODO: check type of object id
        id === undefined ? super() : super(id);
        if (name === undefined){
            //TODO: properly autogenerate filename
            name = this.toString();
        } else if ( typeof name !== 'string' ){
            readStream = name;
        }
        this.readStream = readStream;
        this.name = name;
        log.silly(`--> File '${name}' has been created @'${this.toString()}'`);
    }

    static createFromId(id, fileBucket){
        const readStream = fileBucket.openDownloadStream(ObjectId(id));
        // TODO: get filename from database
        return new File(id, readStream, id);
    }

    uploadTo(fileBucket){
        log.debug(`-> Uploading file '${this.name}' @'${this.toString()}' ...`);
        return new Promise((resolve, reject) => {
            if ( this.readStream !== undefined ){
                this.readStream.pipe(fileBucket.openUploadStreamByFile(this)).on('error',
                    err => reject(err)).on('finish', () => {
                    log.debug(`-> ... file @'${this.toString()}' has been successfully uploaded to GridFS.`);
                    resolve(this);
                });
            } else {
                log.warn(`Trying to upload file @'${this.toString()}' but buffer is empty. Aborting upload.`);
                reject(new fileErrors.EmptyReadStreamError(this));
            }
        });
    }
}

module.exports = File;