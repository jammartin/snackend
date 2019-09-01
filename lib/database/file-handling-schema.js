'use strict';

const Schema = require('mongoose').Schema;
const ObjectId = require('mongoose').Schema.Types.ObjectId;

const deepCopy = require('../../utils/object-helpers').deepCopy;
const readable = require('../../utils/object-helpers').readable;
const File = require('../types/file');

//TODO: allow something like 'File'


class FileHandlingSchema extends Schema {
    constructor(obj){
        const objCopy = deepCopy(obj);
        super(objCopy);
        this.obj = obj;
    }

    readable(){
        log.silly('Making the original passed object readable. '
            + 'Actual schema could have changed.');
        return readable(this.obj);
    }

    add(obj, prefix){
        this._memorizeFileKeystacks(obj);
        super.add(obj, prefix);
    }

    get
    filePaths(){
        return this._fileKeystacks
            .map(keystack => keystack.reduce((k, l) => k + '.' + l));
    }

    // TODO: move to model somehow and/or include validation of doc
    handleFiles(doc, handle){
        return Promise.all(this._fileKeystacks
            .map(keystack => {
                let files = [doc, ...keystack].reduce((obj, key) => obj[key]);
                if ( !Array.isArray(files) ) {
                    files = [files];
                }
                return files.map(file => handle(file));
            }).reduce((acc, val) => acc.concat(val), []) // flatten
        );
    }

    _memorizeFileKeystacks(obj){
        if ( this._fileKeystacks === undefined ) this._fileKeystacks = [];
        if ( obj instanceof FileHandlingSchema ){
            this._fileKeystacks.push(...obj._fileKeystacks);
        } else if ( typeof obj === 'object'){
            const memorizeAndReplace = (obj, keystack) => {
                Object.keys(obj).forEach(key => {
                    if ( obj[key] === File ) {
                        this._fileKeystacks.push([...keystack, key]);
                        obj[key] = ObjectId;
                    } else if ( Array.isArray(obj[key]) && obj[key].some( val => val === File )) {
                        this._fileKeystacks.push([...keystack, key]);
                        obj[key] = [ObjectId];
                    } else if ( typeof obj[key] === 'object' ){
                        memorizeAndReplace(obj[key], [ ...keystack, key ]);
                    }
                });
            };
            memorizeAndReplace(obj, []);
        } else {
            throw new TypeError('Invalid type of `obj` argument passed to `_memorizeFileKeystacks()`.');
        }
    }
}

module.exports = FileHandlingSchema;