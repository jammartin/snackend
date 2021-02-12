'use strict';

const fs = require('fs');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const chaiFiles = require('chai-files');

chai.use(chaiAsPromised);
chai.use(chaiHttp);
chai.use(chaiFiles);
chai.should();

const file = chaiFiles.file;

const readable = require('../utils/object-helpers').readable;

// log helper for logging in tests
// TODO: like it or not?
const testlog = function(msg){
    console.log(`\x1b[34m${msg}\x1b[0m`);
};

const format = require('snackend').logger.format;

const colorizer = format.colorize({
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'grey',
        verbose: 'grey',
        debug: 'grey',
        silly: 'grey'
    }});

// requiring snackend module and initializing logger
const Snackend = require('snackend')({
        level: 'silly',
        silent: false,
        format: format.combine(
            format.timestamp(),
            format.padLevels(),
            format.printf(
                info => colorizer.colorize(info.level
                        ,`${info.timestamp} [${info.level}] ${info.message}`)
                )
        )
    });

const FileHandlingSchema = require('snackend').FileHandlingSchema;
const File = require('snackend').File;

// TODO: cleanup database after test

describe('Chefs-API', function() {

    let app;
    const server = 'http://localhost:3000';

    before('#serve() call to start app', async function(){

        const config = {
            database: {
                dbName: 'snacks'
            }
        };

        app = new Snackend(config);

        app.addController('chefs'
            , new FileHandlingSchema({
                name: String,
                photo: File,
                speciality: String
            }))
            .useEndpointTemplate('create')
            .useEndpointTemplate('findOneBy', 'name')
            .useEndpointTemplate('findOneRandom')
            .useEndpointTemplate('downloadOneFileBy', 'id')
            .useEndpointTemplate('findByQuery');
        await app.serve();
        testlog(`Testing controller with schema: ${app.getController('chefs').schema.readable()}`);
    });

    after('#shutDown() call to close all sockets', function(){
        app.shutDown();
    });

    describe(`EndpointTemplates`, function(){

        // variable will hold the id of the uploaded document which shall then be downloaded
        let idToDownload;

        describe('#create()', function (){
            it('should store a document in the database', async function(){
                const res = await chai.request(server)
                    .post('/chefs/create')
                    .type('form')
                    .attach('photo', fs.readFileSync('assets/cod_and_jam.JPG'), 'cod_and_jam.JPG')
                    .field({name: 'Jam', speciality: 'cod'});

                res.should.have.status(200);
            });
        });

        describe('#findOneBy()', function(){
            it('should retrieve a specific document by the provided field', async function(){
               const res = await chai.request(server)
                   .get('/chefs/find/one/by/name')
                   .type('form')
                   .field({name: 'Jam'});

               res.should.have.status(200);
               res.body.should.have.property('name').equal('Jam');
               res.body.should.have.property('speciality').equal('cod');
               res.body.should.have.property('photo');

               // remember the file for downloading it again later
               idToDownload = res.body.photo;
            });
        });

        describe('#findOneRandom()', function(){
           it('should retrieve a random document', async function(){
               const res = await chai.request(server)
                   .get('/chefs/find/one/random');

               res.should.have.status(200);
               res.body.should.have.property('name');
               res.body.should.have.property('speciality');
               res.body.should.have.property('photo');
               testlog(`        Randomly selected document: ${readable(res.body)}`);
           });
        });

        describe('#downloadOneFileBy()', function(){
            it('should download the file previously uploaded', function(done){
                const res = chai.request(server)
                    .get('/chefs/download/one/file/by/id')
                    .type('form')
                    .field({id: idToDownload})
                    .buffer()
                    .parse(function(res, callback){
                        const writeStream = fs.createWriteStream('assets/cod_and_jam_downloaded.JPG');
                        res.pipe(writeStream)
                            .on('finish', () => callback(null, res))
                            .on('error', () => callback(err));
                    })
                    .end(function(err, res){
                        res.should.have.status(200);
                        file('assets/cod_and_jam_downloaded.JPG').should.equal(file('assets/cod_and_jam.JPG'));
                        done(err);
                    });
            });
        });

        // TODO: include more entries in the database
        describe('#findByQuery()', function(){
            it('should return a cursor to all matching database entries', async function(){
                const res = await chai.request(server)
                    .post('/chefs/find/by/query')
                    .set('Content-Type', 'application/json')
                    .send({query: {speciality: 'cod'}});

                res.should.have.status(200);
            });
        });

    });
});












