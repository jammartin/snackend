'use strict';

const bcrypt = require('bcrypt');

const modelProvider = require('../database/model-provider');
const FileHandlingSchema = require('./file-handling-schema');
const File = require('../types/file');

// TODO: provide extractors for user model from http requests
// TODO: Decide which should be optional fields and implement validation
// TODO: add email, etc. as field ?
const defaultSchema = new FileHandlingSchema({
        name: String,
        pwd: String
        //picture: File //TODO: implement image as optional field
    });

// precompile model for use by AuthHandler
function compile(mongoOperator, schema, collection){
    schema = schema || defaultSchema;
    collection = collection || 'user'; // default collection is 'user'
    return modelProvider(mongoOperator.compileModel(collection, schema), mongoOperator.bucket);
}

// hash the password before inserting into the database
function hashPwd(pwd, saltRounds){
    saltRounds = saltRounds || 10; // default is 10 salt rounds
    return bcrypt.hash(pwd, saltRounds); // returns promise
}

// compare password to hash
function verifyCredentials(guess, pwd){
    return bcrypt.compare(guess, pwd); // returns promise
}


module.exports = {
    defaultSchema: defaultSchema,
    compile: compile,
    hashPwd: hashPwd,
    verifyCredentials: verifyCredentials
};