'use strict';

const log = require('../../utils/logger').log;

const allowedRequestMethods = ['GET', 'POST'];

//TODO: implement multiple middlewares

class Endpoint {
    constructor(route, method, handler, middleware){
        this.route = route;
        this.method = method;
        this.handler = handler;
        this.middleware = middleware;
    }

    _validate(){
        if ( !allowedRequestMethods.includes(this.method) ){
            log.error(`Only the following http request methods are supported: ${allowedRequestMethods}`);
            return false;
        } else return true;
    }

    _provideHandler(ModelWrapper){
        return (ctx, next) => this.handler(ctx, next, ModelWrapper, log);
    }

    compile(router, ModelWrapper){
        if(this._validate()) {
            // TODO: care about middleware
            if (this.method === 'GET') {
                router.get(this.route, this._provideHandler(ModelWrapper));
            } else if (this.method === 'POST') {
                router.post(this.route, this._provideHandler(ModelWrapper));
            } else {
                //TODO: implement HEAD, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH
            }
        } else {
            throw new Error( 'Validation of `Enpoint` instance failed.' );
        }
    }
}

module.exports = Endpoint;
