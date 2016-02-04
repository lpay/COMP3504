var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

var groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    users: [{
        type: ObjectId,
        ref: 'users',
        admin: Boolean
    }],
    pending: [{
        type: ObjectId,
        ref: 'users',
        admin: Boolean
    }]
});

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;