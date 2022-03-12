const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./User');
const Room = require('./Room');

// create schema
const PermissionSchema = new Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },
    rooms: {
        type: [String],
        required: true
    },
    date_updated: {
        type: Date,
        default: Date.now
    }
});

module.exports = Permission = mongoose.model('permission', PermissionSchema, 'permissions');