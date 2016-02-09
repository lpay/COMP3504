/**
 * Created by mark on 1/14/16.
 *
 *
 * API ENDPOINTS
 *
 * POST     /auth/signup    create user and generate json web token
 * POST     /auth/login     validate credentials and generate json web token
 * POST     /auth/google    validate google access token and generate json web token
 */

var express = require('express');
var request = require('request');
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user');

//
// Routes
//
var router = express.Router();

router.post('/auth/signup', function(req, res, next) {

    if (!req.body.email)
        return res.status(400).send({ error: "UserBadRequest", message: "email address is required" });

    // validate email format
    var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!regex.test(req.body.email))
        return res.status(400).send({ error: "UserInvalidEmail", message: "invalid email address" });

    // validate email uniqueness
    User.findOne({ email: req.body.email }, 'email', function(err, existingUser) {

        if (err)
            return next(err);

        if (existingUser)
            return res.status(400).send({ error: "UserEmailExists", message: "email address exists" });

        // if password is set, create the account, otherwise just perform email validation

        if (!req.body.password)
            return res.send({ message: "valid email" });

        // create user
        User.create({
            email: req.body.email,
            password: req.body.password
        }, function(err, user) {

            if (err)
                return next(err);

            user.generateToken(function(token) {
                res.send({ token: token });
            });
        });
    });
});

router.post('/auth/login', function(req, res, next) {

    if (!req.body.email)
        return res.status(400).send({ message: 'email is required' });

    if (!req.body.password)
        return res.status(400).send({ message: 'password is required'});

    User.findOne({ email: req.body.email }, '+password', function(err, user) {

        if (err)
            return next(err);

        if (!user)
            return res.status(401).send({ message: 'invalid email' });

        user.validatePassword(req.body.password, function(err, isMatch) {

            if (err)
                return next(err);

            if (!isMatch)
                return res.status(401).send({ message: 'invalid password' });

            user.generateToken(function(token) {
                return res.send({ token: token });
            });
        });
    });

});

router.post('/auth/google', function(req, res, next) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: config.GOOGLE_SECRET,
        redirect_uri: req.body.redirectUri,
        grant_type: 'authorization_code'
    };

    request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
        var accessToken = token.access_token;
        var headers = { Authorization: 'Bearer ' + accessToken };

        request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
            if (profile.error)
                return res.status(500).send({ message: profile.error.message });

            if (req.headers.authorization) {
                User.findOne({ google: profile.sub }, function(err, existingUser) {

                    if (existingUser)
                        return res.status(409).send({ message: 'google account exists' });

                    var token = req.headers.authorization.split(' ')[1];
                    var payload = jwt.decode(token, config.AUTH_SECRET);

                    User.findById(payload.sub, function(err, user) {

                        if (err)
                            return next(err);

                        if (!user)
                            return res.status(400).send({ message: 'user not found' });

                        user.google = profile.sub;
                        user.name = user.name || profile.name;

                        user.save(function(err) {

                            if (err)
                                return next(err);

                            user.generateToken(function(token) {
                                res.send({ token: token });
                            });
                        });
                    });
                });

            } else {
                User.findOne({ google: profile.sub }, function(err, existingUser) {

                    if (existingUser) {
                        existingUser.generateToken(function(token) {
                            res.send({ token: token });
                        });
                    } else {
                        User.create({
                            email: profile.email,
                            google: profile.sub
                        }, function (err, user) {
                            if (err)
                                return next(err);

                            user.generateToken(function (token) {
                                res.send({token: token});
                            });
                        })
                    }
                });
            }
        })
    });
});

module.exports = router;
