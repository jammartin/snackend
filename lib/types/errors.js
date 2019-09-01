'use strict';

class UnderConstructionError extends Error {
    constructor(msg){
        super(msg);
    }
}

class EmptyReadStreamError extends Error {
    constructor(file){
        super(`File @'${file.toString()}' with undefined read-stream can't be uploaded.`);
    }
}

class NotIntendedToSupportError extends Error {
    constructor(msg){
        super(msg);
    }
}

module.exports = {
    General: {
        UnderConstructionError: UnderConstructionError,
        NotIntendedToSupportError: NotIntendedToSupportError
    },
    File: {
        EmptyReadStreamError: EmptyReadStreamError
    }
};