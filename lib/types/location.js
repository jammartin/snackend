const Schema = require('mongoose').Schema;

const Location = new Schema(
    // take from https://mongoosejs.com/docs/geojson.html
    {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    });