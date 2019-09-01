'use strict';

// TODO: implement optional arguments such as projection and sort

const Endpoint = require('../core/endpoint');
const File = require('../types/file');
const generalErrors = require('../types/errors').General;
const readable = require('../../utils/object-helpers').readable;

class EndpointTemplates {
    constructor(schema){
        this._schema = schema;
    }

    create(){
        if(this._schema.paths.$isMongooseArray){
            const errMsg = 'Arrays of `File`s are currently not supported in endpoint template `create()`.';
            log.error(errMsg);
            throw new generalErrors.UnderConstructionError(errMsg);
        }
        return new Endpoint('/create', 'POST', async (ctx, next, Model, log) => {
            const model = new Model();
            Object.keys(this._schema.paths).forEach(path => {
                if (this._schema.filePaths.includes(path)){
                    const file = ctx.request.files.find(file => file.fieldname === path);
                    model[path] = new File(file.filename, file);
                } else {
                    model[path] = ctx.request.body[path];
                }
            });
            await model.save();
            ctx.status = 200;
        });
    }

    retrieveOneBy(field){
        return new Endpoint(`/retrieve/one/by/${field}`, 'GET', async (ctx, next, Model, log) => {
            const query = {};
            query[field] = ctx.query[field] !== undefined ? ctx.query[field] : ctx.request.body[field];
            ctx.body = await Model.findOne(query).exec();
            ctx.status = 200;
        });
    }

    retrieveOneRandom(){
        return new Endpoint('/retrieve/one/random', 'GET', async (ctx, next, Model, log) => {
            const res = await Model.aggregate().sample(1).exec();
            ctx.body = res[0];
            ctx.status = 200;
        });
    }

    downloadOneFileBy(field){
        // filed can only be 'id' or 'name'
        if ( !['id', 'name'].includes(field) ){
            const errMsg = `Downloading files by another field (here '${field}') `
                + `than 'id' or 'name' is not supported.`;
            log.error(errMsg);
            throw new generalErrors.NotIntendedToSupportError(errMsg);
        } else if ( field === 'name' ){
            const errMsg = 'Downloading a file by \'name\' is currently not supported '
                + 'in endpoint template `downloadOneFileBy()`.';
            log.error(errMsg);
            throw new generalErrors.UnderConstructionError(errMsg);
        }
        return new Endpoint(`/download/one/file/by/${field}`, 'GET', async (ctx, next, Model, log) => {
            let param = ctx.query[field] !== undefined ? ctx.query[field] : ctx.request.body[field];
            const file = File.createFromId(param, Model.fileBucket);
            // TODO: set mime type
            log.debug(`Providing download stream for \`File\` @${file.toString()}`);
            ctx.attachment(file.name);
            ctx.body = file.readStream;
            ctx.status = 200;
        });
    }

    // TODO: only json request is possible, check if other request types are possible
    // TODO: cleanup database and use different content to check functionality
    findByQuery(){
        return new Endpoint(`/find/by/query`, 'POST', async (ctx, next, Model, log) => {
            const condition = ctx.request.body['query'];
            const projection = ctx.request.body['projection'];
            const options = ctx.request.body['options'];

            ctx.body = await Model.find(condition, projection, options).exec();
            ctx.status = 200;
        });
    }
}

module.exports = EndpointTemplates;


