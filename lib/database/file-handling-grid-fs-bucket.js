'use strict';

const GridFSBucket = require('mongodb').GridFSBucket;

const File = require('../types/file');


class FileHandlingGridFSBucket extends GridFSBucket {

    constructor(db){
        super(db);
    }

    openUploadStreamByFile(file){
        if (file instanceof File){
            return this.openUploadStreamWithId(file, file.name);
        } else {
            throw new TypeError('File argument passed to `openUploadStreamByFile()` must be an instance of ' +
                '`File`');
        }
    }

    openDownloadStreamByFile(file){
        if (file instanceof File){
            return this.openDownloadStream(file);
        } else {
            throw new TypeError('File argument passed to `openDownloadStreamByFile()` must be an instance of ' +
                '`File`');
        }
    }
}

module.exports = FileHandlingGridFSBucket;
