'use strict';

const fs = require('fs');
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const log = require('../../utils/logger').log;

const UserModel = require('../database/user-model');
// TODO: implement access levels
// TODO: implement sessions

function getSecretKey(){
    // TODO: read key file from environment variable etc.
    return fs.readFileSync('secret_key');
}

// TODO: Exctract crendential keys from UserModel
function createJwt(user){
    return new Promise((resolve, reject) => {
        // TODO: sign with RSA SHA256
        // TODO: read key file from environment varible etc.
        jwt.sign({ username: user.name }, getSecretKey(), (err, token) => {
            if(err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
}

async function loadUser(userModel, username, projection){
    projection = projection || 'name';
    // TODO: extract keys for credentials from UserModel
    return await userModel.findOne({name: username}, projection).exec();
}


class AuthHandler {

    constructor(app, userModel){
        app.use(passport.initialize());
        // defining strategies
        // local strategy ios use for the login and returns JWT, which is used to establish kind of a session
        passport.use(new LocalStrategy({ usernameField: 'username', session: false }, async (username, password, done) => {
            const user = await loadUser(userModel, username, 'name pwd');
            log.silly(`AuthHandler: Attempting logging in '${username}'`);
            if(user === null) {
                log.debug(`AuthHandler: Username '${username}' not found.`);
                done(null, false, { message: 'Username not found.' });
            } else {
                // TODO: extract keys for credentials from UserModel
                const valid = await UserModel.verifyCredentials(password, user.pwd);
                if(valid){
                    log.debug(`AuthHandler: Valid credentials. Logging in '${username}'.`);
                    createJwt(user).then((token) => done(null, { jwt: token })
                        , (err) => {
                            log.error(err);
                            done(null, false, { message: 'Ooops! Something unexpected happened.' });
                        });
                } else {
                    log.debug(`AuthHandler: Invalid credentials. Aborting.`);
                    done(null, false, { message: 'Credentials don\'t match.' });
                }
            }
        }));
        // jwt strategy, will be used once logged in until token expires
        passport.use(new JwtStrategy({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: getSecretKey()
        }, async (jwtPayload, done) => {
            log.silly(`AuthHandler: Processing JWT authentication request.`);
            const user = await loadUser(userModel, jwtPayload.username);
            if(user){
                log.debug(`AuthHandler: Verified JWT received from '${jwtPayload.username}'`);
                done(null, user);
            } else {
                log.error(`AuthHandler: 'username' provided in JWT not found.`);
                done(null, false, { message: 'Something is wrong with the provided JWT.' });
            }
        }));
    }

    // wrappers for desired strategies
    local(callback, ctx, next){
        return passport.authenticate('local', {session: false}, callback)(ctx, next);
    }

    jwt(callback, ctx, next){
        return passport.authenticate('jwt', {session: false}, callback)(ctx, next);
    }
}

module.exports = AuthHandler;