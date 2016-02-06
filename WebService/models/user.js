/**
 * Created by mark on 1/14/16.
 *
 */

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var ObjectId = mongoose.Schema.ObjectId;

var userSchema =  new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    name: String,
    created_at: Date,
    updated_at: Date,
    last_login: Date,
    google: String,
    facebook: {},
    twitter: {},
    groups: [{
        type: ObjectId,
        ref: 'groups'
    }]
});

userSchema.pre('save', function(next) {
    var user = this;

    // update timestamps
    if (!user.created_at) {
        user.created_at = new Date();
    } else {
        user.updated_at = new Date();
    }

    // update password hash
    if (user.isModified('password')) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

userSchema.methods.validatePassword = function(password, done) {
    var user = this;

    bcrypt.compare(password, user.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model('User', userSchema);

module.exports = User;