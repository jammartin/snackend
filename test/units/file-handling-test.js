'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;

const deepCopy = require('../../utils/object-helpers').deepCopy;

const FileHandlingSchema = require('snackend').FileHandlingSchema;
const File = require('snackend').File;

describe('FileHandlingSchema', function(){

    // Dummy data objects
    let obj, objToAdd, mongooseObj, mongooseObjToAdd, snackSchema, mongooseSnackSchema;

    before('populate dummy data', function(){
        obj = {
            name: String,
            vegan: Boolean,
            pictures: [File]
        };

        mongooseObj = deepCopy(obj);
        mongooseObj.pictures = [ObjectId];

        snackSchema = new FileHandlingSchema(obj);
        mongooseSnackSchema = new Schema(mongooseObj);

        objToAdd = {
            recipe: {
                source: String,
                pdf: File
            },
            ingredients: [String]
        };

        mongooseObjToAdd = deepCopy(objToAdd);
        mongooseObjToAdd.recipe.pdf = ObjectId;
    });

    it('should hold the original object in its `obj` property', function(){
        snackSchema.obj.should.equal(obj);
    });

    describe('#add()', function(){

        it('should append the keystack of `File` to `_fileKeystacks` property', function(){
            snackSchema.add(objToAdd);
            snackSchema.should.have.property('_fileKeystacks')
                .eql([['pictures'], ['recipe', 'pdf']]);
        });

        it('should result in an extended schema with `File` replaced by `ObjectId`', function(){
            mongooseSnackSchema.add(mongooseObjToAdd);
            JSON.stringify(snackSchema.paths).should.equal(JSON.stringify(mongooseSnackSchema.paths));
        });
    });

    describe('get #filePaths()', function(){
        it('should return the paths of the `File`s in the schema', function(){
           snackSchema.filePaths.should.eql(['pictures', 'recipe.pdf']);
        });
    });

    describe('#handleFiles()', function(){

        let doc;

        before('populate dummy document with data', function(){
            doc = {
                name: 'Salmon Burger',
                vegan: false,
                pictures: [new File('on-plate'), new File('close-up')],
                recipe: {
                    source: 'https://en.wikipedia.org/wiki/Salmon_burger',
                    pdf: new File('how-much-is-the-fish'),
                    ingredients: ['Salmon', 'Egg', 'Bread', 'Lettuce']
                }
            };
        });

        it('should return a promise resolving to a list of results of the `handle`', function(){
            snackSchema.handleFiles(doc, file => file.name)
                .should.eventually.eql(['on-plate', 'close-up', 'how-much-is-the-fish']);
        });
    });
});