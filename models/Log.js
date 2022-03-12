const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Room = require('./Room');

// create schema
const LogSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true
    },
    property: {
        type: Boolean,
        required: true
    },
    message: {
        type: String
    }
});

module.exports = Log = mongoose.model('log', LogSchema, 'logs');