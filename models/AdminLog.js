const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const AdminLogSchema = new Schema({
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
    request: {
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
    message: {
        type: String
    }
});

module.exports = AdminLog = mongoose.model('adminLog', AdminLogSchema, 'adminLogs');