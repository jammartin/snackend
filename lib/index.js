'use strict';

const Controller = require('./core/controller');
const Endpoint = require('./core/endpoint');
const ProtectedEndpoint = require('./core/protected-endpoint');
const FileHandlingSchema = require('./database/file-handling-schema');
const File = require('./types/file');
const Location = require('./types/location');

module.exports = {
    Controller: Controller,
    Endpoint: Endpoint,
    ProtectedEndpoint: ProtectedEndpoint,
    FileHandlingSchema: FileHandlingSchema,
    File: File,
    Location: Location
};