'use strict';

const assert = require('assert');

const log = require('../../utils/logger').log;

const Endpoint = require('./endpoint');


class ProtectedEndpoint extends Endpoint{

    constructor(route, method, handler, strategy){
        super(route, method); // add handler later
        this._handler = handler;
        this._strategy = strategy || 'jwt'; // default is jwt authentication
    }

    // Overrides
    compile(router, Model, authHandler){
        // add authentication middleware to handler to be compiled into endpoint
        this.handler = (ctx, next, Model, log) => authHandler[this._strategy](async (err, user, info, status) => {
            assert.ifError(err);
            if(user) {
                ctx.user = user;
                await this._handler(ctx, next, Model, log); // user is authenticated
            } else { // Unauthorized
                log.verbose(`--> Rejected authorization request: ${info.name}: ${info.message}`);
                ctx.body = info;
                ctx.status = 401;
            }
            }, ctx, next);
        return super.compile(router, Model);
    }
}

module.exports = ProtectedEndpoint;