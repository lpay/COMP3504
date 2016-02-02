/**
 * Created by mark on 1/14/19.
 *
 *
 * API ENDPOINTS
 *
 * POST     /auth/login     validate credentials and generate session token
 * POST     /auth/google
 */

var express = require('express');
var request = require('request');
var jwt = require('jsonwebtoken');

var User = require('../models/user');
var router = express.Router();

//
// Routes
//

router.post('/auth/register', function(req, res, next) {

});

router.post('/auth/login', function(req, res, next) {

    User.findOne({ email: req.body.email }, '+password', function(err, user) {

        if (err) return next(err);

        if (user) {
            user.validatePassword(req.body.password, function(err, isMatch) {

                if (err) return next(err);

                if (isMatch) {
                    res.json({ token: jwt.sign(user._id, req.app.get('authKey')) });
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

                    User.findById(payload, function(err, user) {

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
                        return res.json({ token: jwt.sign(existingUser._id, req.app.get('authKey')) });
                    }

                    var user = new User();

                    user.email = profile.email;
                    user.google = profile.sub;

                    user.save(function(err) {
                        if (err) return next(err);

                        var token = jwt.sign(user._id, req.app.get('authKey'));

                        console.log(token);
                        res.json({ token: token });
                    })
                });
            }
        })
    });
});


module.exports = router;
