/**
 * Created by mark on 1/14/16.
 *
 */

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment');
var config = require('../config');

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

userSchema.methods.generateToken = function(done) {
    var user = this;

    var token = jwt.sign({
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    }, config.AUTH_SECRET);

    done(token);
};

var User = mongoose.model('User', userSchema);

module.exports = User;