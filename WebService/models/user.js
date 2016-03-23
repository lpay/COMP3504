/**
 * Created by mark on 1/14/16.
 *
 */

var Promise = require('bluebird');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = Promise.promisifyAll(require('bcryptjs'));
var moment = require('moment');
var util = require('util');
var config = require('../config');

var APIError = require('../errors/APIError');

var userSchema =  new mongoose.Schema({

    // Login Information
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    google: String,
    facebook: String,
    twitter: String,

    // Personal Information
    name: {
        type: {
            title: String,
            first: String,
            last: String
        },
        required: true
    },
    phone: { type: String },
    address: { type: String },
    province: { type: String },
    postalCode: { type: String },

    // Meta
    created_at: Date,
    updated_at: Date,
    last_login: Date
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
        bcrypt.genSaltAsync(10)
            .then(salt => bcrypt.hashAsync(user.password, salt))
            .then(hash => user.password = hash)
            .finally(next);
    } else {
        next();
    }
});


userSchema.statics.Create = function(email, password, name)
{
    var model = this.model('User');

    return model.validateEmail(email)
        .then( email => model.create({ email: email, password: password, name: name }) );
};

userSchema.statics.validateEmail = function(email) {

    var model = this.model('User');

    return Promise.try( () => {

        email = email.trim();

        var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!regex.test(email))
            throw new APIError(400, 'invalid email address');

        return email;
    })
    .then(email => [ model.findOne({ email: email}, 'email'), email ])
    .spread((existingUser, email) => {
        if (existingUser)
            throw new APIError(401, 'email exists');

        return email;
    });
};

userSchema.methods.validatePassword = function(password) {
    var user = this;

    return bcrypt.compareAsync(password, user.password)
        .then(match => {
            if (!match)
                throw new APIError(403, 'invalid password');

            return user;
        });
};

userSchema.methods.generateToken = function() {
    var user = this;

    // generate token
    var token = jwt.sign({
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    }, config.AUTH_SECRET);

    // update user
    user.last_login = new Date();

    return user.save()
        .then(() => [ user, token ]);
};

userSchema.statics.Authenticate = function(email, password) {
    return this.model('User').findOne({ email: email }, '+password')
        .then(user => {
            if (!user)
                throw new APIError(404, 'user not found');

            return user.validatePassword(password);
        });
};

module.exports = mongoose.model('User', userSchema);