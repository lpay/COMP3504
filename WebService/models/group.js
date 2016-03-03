/**
 * Created by mark on 1/14/16.
 *
 */


var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

var groupSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    hoursOfOperation: [{
        day: { type: String, enum: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
        startTime: Date,
        endTime: Date
    }],
    professionals: {
        require_approval: { type: Boolean, default: false },
        admins: [{
            type: ObjectId,
            ref: 'User'
        }],
        users: [{
            type: ObjectId,
            ref: 'User'
        }],
        pending: [{
            type: ObjectId,
            ref: 'User'
        }]
    },
    clients: {
        require_approval: { type: Boolean, default: false },
        users: [{
            type: ObjectId,
            ref: 'User'
        }],
        pending: [{
            type: ObjectId,
            ref: 'User'
        }]
    }
});

groupSchema.methods.join = function(user, group) {

};

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;