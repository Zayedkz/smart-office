const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const UserSchema = new Schema({
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
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    password_raw: {
        type: String,
        required: true
    },
    user: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    superuser: {
        type: Boolean,
        default: false
    },
    register_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema, 'users');