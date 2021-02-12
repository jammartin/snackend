'use strict';

const assert = require('assert');
const Router = require('koa-router');

const log = require('../../utils/logger').log;
const modelProvider = require('../database/model-provider');
const EndpointTemplates = require('../templates/endpoint-templates');
const ProtectedEndpoint = require('./protected-endpoint');

class Controller{
    constructor(collection, schema, path) {
        this.router = new Router({
            prefix: path
        });
        this.collection = collection;
        this._schema = schema;
        this.path = path;
        this.endpoints = [];
        this._endpointTemplates = new EndpointTemplates(this.schema);
    }

    addEndpoint(endpoint){
        this.endpoints = [...this.endpoints, endpoint];
        return this; // instance is returned for chaining calls
    }

    useEndpointTemplate(id, options) {
        log.verbose(`--> Adding '${id}' endpoint to controller @'${this.path}'`);
        return this.addEndpoint(this._endpointTemplates[id](options));
    }

    useProtectedEndpointTemplate(id, options) {
        log.verbose(`--> Adding protected '${id}' endpoint to controller @'${this.path}'`);
        return this.addEndpoint(
            new ProtectedEndpoint(this._endpointTemplates[id](options)));
    }

    compile(mongoOperator, authHandler){
        log.info(`-> Compiling controller for collection '${this.collection}' on path @'${this.path}'`);
        const CompiledModel = mongoOperator.compileModel(this.collection, this._schema);
        const Model = modelProvider(CompiledModel, mongoOperator.bucket);
        this.endpoints.map(ep => {
            if (ep instanceof ProtectedEndpoint){
                assert.ifError(ep.compile(this.router, Model, authHandler));
            } else assert.ifError(ep.compile(this.router, Model));
        });
        return this.router;
    }

    get schema(){
        return this._schema;
    }
}

module.exports = Controller;