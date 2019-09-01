'use strict';

const Koa = require('koa');
const busboy = require('koa-busboy');
const bodyParser = require('koa-bodyparser')

const configurationHelper = require('../configuration/configuration-helper');

const log = require('../utils/logger').log;
const mongoOperator = require('./database/mongo-operator');
const Controller = require('./core/controller');


class Snackend {
    constructor(options) {
        this.config = configurationHelper(options);
        this._app = new Koa();
        this._app.use(busboy());
        this._app.use(bodyParser());
        this._controllers = [];
        log.verbose(`App ${this.config.general.name} has been created.`);
    }

    addController(collection, schema, path) {
        path = path === undefined ? '/' + collection : path;
        log.verbose(`-> Adding controller for collection '${collection}' @'${path}'`);
        this._controllers[collection] = new Controller(collection, schema, path);
        return this._controllers[collection];
    }

    useController(template){
        // TODO: implement usage of predefined controllers
    }

    serve(){
        return new Promise((resolve, reject) => {
            log.info('Starting up ...');
            mongoOperator(this.config.database).then((mongoOperator) => {
                this._mongoOperator = mongoOperator;
                const routers = Object.keys(this._controllers)
                    .map(key => this._controllers[key].compile(mongoOperator));
                routers.forEach((router) => this._app.use(router.routes()).use(router.allowedMethods()));

                this._server = this._app.listen(this.config.port, () => {
                    log.info(`... ${this.config.general.name} is listening on port ${this.config.port}.`);
                    resolve(this);
                });
            }, err => {
                log.error(err);
                reject(err);
            });
        });
    }

    shutDown(){
        log.info(`Shutting down ${this.config.general.name} ...`);
        if (this._mongoOperator === undefined || this._server === undefined ) {
            log.warn(`Attempting to shut down before ${this.config.general.name} has been serving successfully.`);
        }
        if ( this._server !== undefined ){
            this._server.close();
            log.debug('Underlying Koa server has been closed.');
        }
        if ( this._mongoOperator !== undefined ) {
            this._mongoOperator.disconnect();
            log.debug('Connection to database has been closed.');
        }
        log.info('... done.');
    }

    getController(id){
        if (this._controllers[id] === undefined){
            log.warn(`Controller with id '${id}' is not defined.`);
        }
        return this._controllers[id];
    }
}

module.exports = Snackend;