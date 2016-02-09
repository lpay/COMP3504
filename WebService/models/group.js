/**
 * Created by mark on 1/14/16.
 *
 */


var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

var groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    admins: [{
        type: ObjectId,
        ref: 'users'
    }],
    users: [{
        type: ObjectId,
        ref: 'users'
    }],
    pending: [{
        type: ObjectId,
        ref: 'users'
    }]
});

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;