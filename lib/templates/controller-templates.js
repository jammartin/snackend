'use strict';

const Controller = require('../core/controller');
const UserModel = require('../database/user-model');
const File = require('../types/file');
const Endpoint = require('../core/endpoint');
const ProtectedEndpoint = require('../core/protected-endpoint');

class ControllerTemplates {

    constructor(){
        this.paths = { user: '/user'}
    }

    user(options){
        // TODO: extract keys for credentials from UserModel
        return new Controller('user', UserModel.defaultSchema, this.paths['user'])
            .useEndpointTemplate('findOneBy', 'name')
            .addEndpoint(new Endpoint('/signup', 'POST', async (ctx, next, Model, log) => {
                const model = await Model.findOne({ name: ctx.request.body['name'] }, 'name');
                if (model !== null) {
                    log.info(`-> Rejected request: 'name' with value '${ctx.request.body['name']}' already exists.`);
                    ctx.body = { errmsg: `Provided value for 'username' already exists.` };
                    ctx.status = 420; // TODO: Check if 'Policy Not Fulfilled' is the right choice here
                } else {
                    const model = new Model();
                    Object.keys(UserModel.defaultSchema.paths).forEach(path => {
                        if (UserModel.defaultSchema.filePaths.includes(path)) {
                            const file = ctx.request.files.find(file => file.fieldname === path);
                            model[path] = new File(file.filename, file);
                        } else {
                            // TODO: extract keys for credentials from UserModel
                            if (path !== 'pwd') model[path] = ctx.request.body[path];
                        }
                    });
                    // hash password before saving
                    // TODO: extract keys for credentials from UserModel
                    model['pwd'] = await UserModel.hashPwd(ctx.request.body['pwd']);
                    await model.save();
                    log.debug(`UserController: Created a new user. Greetings ${ctx.request.body['name']} :)`);
                    ctx.status = 200;
                }
            }))
            .addEndpoint(new ProtectedEndpoint('/login', 'POST', (ctx, next, Model, log) => {
                // returning jwt
                log.silly('UserController: User logged in successfully. Responding with JWT.');
                ctx.body = ctx.user.jwt;
                ctx.status = 200;
            }, 'local'));
    }
}


module.exports = ControllerTemplates;
