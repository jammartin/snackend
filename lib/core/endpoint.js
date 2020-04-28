'use strict';

const log = require('../../utils/logger').log;

const allowedRequestMethods = ['GET', 'POST'];


class Endpoint {
    constructor(route, method, handler){
        this.route = route;
        this.method = method;
        this.handler = handler;
    }

    _validate(){
        if ( !allowedRequestMethods.includes(this.method) ){
            log.error(`Only the following http request methods are supported: ${allowedRequestMethods}`);
            return false;
        } else return true;
    }

    _provideHandler(Model){
        return (ctx, next) => this.handler(ctx, next, Model, log);
    }

    compile(router, Model){
        if(this._validate()) {
            if (this.method === 'GET') {
                router.get(this.route, this._provideHandler(Model));
            } else if (this.method === 'POST') {
                router.post(this.route, this._provideHandler(Model));
            } else {
                //TODO: implement HEAD, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH
            }
        } else {
            //TODO: create validation error and throw it here
            throw new Error( 'Validation of `Enpoint` instance failed.' );
        }
    }
}

module.exports = Endpoint;
