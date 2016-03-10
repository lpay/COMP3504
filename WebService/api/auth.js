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

var router = require('express').Router();
var http = require('request-promise');
var config = require('../config');
var User = require('../models/user');

//
// Routes
//

router.post('/auth/signup', function (req, res, next) {

    if (!req.body.email) return res.status(400).send({ message: 'email address is required' });
    if (!req.body.password) return res.status(400).send({ message: 'password is required' });
    if (!req.body.name) return res.status(400).send({ message: 'name is required' });

    User.Create(req.body.email, req.body.password, req.body.name)
        .then(user => user.generateToken())
        .spread((user, token) => res.status(201).location('/users/' + user._id).send({ token: token }))
        .catch(next);
});

router.post('/auth/login', function (req, res, next) {

    if (!req.body.email) return res.status(400).send({message: 'email is required'});
    if (!req.body.password) return res.status(400).send({message: 'password is required'});

    User.Authenticate(req.body.email, req.body.password)
        .then(user => user.generateToken())
        .spread((user, token) => res.status(200).location('/profile').send({ token: token }))
        .catch(next);
});

router.post('/auth/google', function (req, res, next) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: config.GOOGLE_SECRET,
        redirect_uri: req.body.redirectUri,
        grant_type: 'authorization_code'
    };

    http.post(accessTokenUrl, {json: true, form: params})
        .then(token => http.get(peopleApiUrl, {headers: {Authorization: token.token_type + ' ' + token.access_token}, json: true}))
        .then(profile => {
            if (profile.error)
                throw new APIError(500, profile.error);

            return User.findOneAndUpdate(
                {
                    $or: [
                        {email: profile.email},
                        {google: profile.sub}
                    ]
                },
                {
                    email: profile.email,
                    name: {first: profile.given_name, last: profile.family_name},
                    google: profile.sub
                },
                {upsert: true, new: true}
            );
        })
        .then(user => user.generateToken())
        .spread((user, token) => res.status(201).location('/users/' + user._id).send({token: token}))
        .catch(next);
});

module.exports = router;