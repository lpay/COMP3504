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

var userSchema =  new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    name: {
        type: {
            first: String,
            last: String
        },
        required: true
    },
    created_at: Date,
    updated_at: Date,
    last_login: Date,
    google: String,
    facebook: String,
    twitter: String
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
            throw new InvalidEmailError('invalid email address');

        return email;
    })
    .then(email => [ model.findOne({ email: email}, 'email'), email ])
    .spread((existingUser, email) => {
        if (existingUser)
            throw new InvalidEmailError('email exists');

        return email;
    });
};

userSchema.methods.validatePassword = function(password) {
    var user = this;

    return bcrypt.compareAsync(password, user.password)
        .then(match => {
            if (!match)
                throw new AuthenticationError('invalid password');

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
                throw new AuthenticationError('user not found');

            return user.validatePassword(password);
        });
};


var AuthenticationError = function(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
};
util.inherits(AuthenticationError, Error);

var InvalidEmailError = function(message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
};
util.inherits(InvalidEmailError, Error);

userSchema.statics.AuthenticationError = AuthenticationError;
userSchema.statics.InvalidEmailError = InvalidEmailError;

module.exports = mongoose.model('User', userSchema);