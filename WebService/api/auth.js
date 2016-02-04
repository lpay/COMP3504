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

var User = require('../models/user');


//
// Routes
//
var router = express.Router();

router.post('/auth/signup', function(req, res, next) {

    if (req.body.email) {

        // validate email format
        var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (regex.test(req.body.email)) {

            // validate email uniqueness
            User.findOne({ email: req.body.email }, 'email', function(err, existingUser) {

                if (err) return next(err);

                if (existingUser) {
                    res.status(400).json({ error: "UserEmailExists", message: "email address exists" });
                } else {

                    // if password is set, create the account, otherwise just perform email validation
                    if (req.body.password) {

                        // TODO: Validate password? (restrictions are probably not a good idea...)

                        // create user
                        var user = new User({
                            email: req.body.email,
                            password: req.body.password
                        });

                        user.save(function(err) {

                            if (err) return next(err);

                            res.json({ token: jwt.sign(user._id, req.app.get('authKey')) });
                        });
                    } else {
                        res.json({ message: "valid email" });
                    }
                }
            });

        } else {
            res.status(400).json({ error: "UserInvalidEmail", message: "invalid email address" });
        }

    } else {
        res.status(400).json({ error: "UserBadRequest", message: "email address is required" });
    }
});

router.post('/auth/login', function(req, res, next) {

    User.findOne({ email: req.body.email }, '+password', function(err, user) {

        if (err) return next(err);

        if (user) {
            user.validatePassword(req.body.password, function(err, isMatch) {

                if (err) return next(err);

                if (isMatch) {
                    var token = jwt.sign({ sub: user._id }, req.app.get('authKey'));
                    res.json({ token: token });

                } else {
                    res.json(401, { message: 'invalid password' });
                }
            });
        } else {
            res.json(401, { message: 'invalid email' });
        }
    });

});

router.post('/auth/google', function(req, res, next) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: 'XCPQg1bZVMhbPnH8DTJpOKQv',
        redirect_uri: req.body.redirectUri,
        grant_type: 'authorization_code'
    };

    request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
        var accessToken = token.access_token;
        var headers = { Authorization: 'Bearer ' + accessToken };

        request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
            if (profile.error) {
                return res.status(500).send({ message: profile.error.message });
            }

            if (req.headers.authorization) {
                User.findOne({ google: profile.sub }, function(err, existingUser) {

                    if (existingUser)
                        return res.status(409).send({ message: 'google account exists'});

                    var token = req.headers.authorization.split(' ')[1];
                    var payload = jwt.decode(token, req.app.get('authKey'));

                    User.findById(payload.sub, function(err, user) {

                        if (err) return next(err);

                        if (user) {
                            user.google = profile.sub;
                            user.name = user.name || profile.name;

                            user.save(function(err) {

                                if (err) return next(err);

                                res.send({ token: jwt.sign(user._id, req.app.get('authKey'))});

                            });

                        } else {
                            return res.status(400).send({ message: 'user not found' });
                        }
                    });
                });
            } else {
                User.findOne({ google: profile.sub }, function(err, existingUser) {

                    if (existingUser) {
                        var token = jwt.sign({ sub: existingUser._id }, req.app.get('authKey'));
                        return res.json({ token: token });
                    }

                    var user = new User();

                    user.email = profile.email;
                    user.google = profile.sub;

                    user.save(function(err) {
                        if (err) return next(err);

                        var token = jwt.sign({ sub: user._id }, req.app.get('authKey'));

                        console.log(token);
                        res.json({ token: token });
                    })
                });
            }
        })
    });
});

module.exports = router;
