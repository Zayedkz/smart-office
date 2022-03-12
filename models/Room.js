const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const RoomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    thing_id: {
        type: String,
        required: true
    },
    property_id: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    unlocked: {
        type: Boolean,
        default: false
    },
    register_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Room = mongoose.model('room', RoomSchema, 'rooms');