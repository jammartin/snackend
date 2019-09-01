'use strict';

const mongoose = require('mongoose');

const log = require('../../utils/logger').log;
const FileHandlingGridFSBucket = require('./file-handling-grid-fs-bucket');

class MongoOperator {

    constructor(config) {
        this._mongoose = mongoose;
        return new Promise((resolve, reject) => {
            this._mongoose.connect(config.mongoDbHost, { dbName: config.dbName, useNewUrlParser: true })
                .then(() => {
                    log.info(`-> Connected successfully to MongoDB hosted on '${config.mongoDbHost}'`);
                    this._bucket = new FileHandlingGridFSBucket(this._mongoose.connection.db);
                    resolve(this);
                }, err => {
                    reject(err);
                });
        });
    }

    compileModel(name, schema) {
        return this._mongoose.model(name, schema);
    }

    dropDatabase(){
        this._mongoose.connection.db.dropDatabase();
    }

    disconnect(){
        this._mongoose.connection.close();
    }

    get bucket(){
        return this._bucket;
    }
}

function mongoOperator(config){
    return new MongoOperator(config);
}

module.exports = mongoOperator;