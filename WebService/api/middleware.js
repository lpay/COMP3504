/**
 * Create by mark on 2/3/16.
 *
 */

var moment = require('moment');
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user');

exports.ensureAuthenticated = function(req, res, next) {

    if (!req.headers.authorization)
        return res.status(401).send({ message: 'authorization required' });

    var token = req.headers.authorization.split(' ')[1];

    var payload = null;

    try {
        payload = jwt.decode(token, config.AUTH_SECRET);
    } catch (err) {
        return res.status(401).send({ message: err.message });
    }

    if (payload.exp < moment().unix())
        return res.status(401).send({ message: 'token expired' });

    User.findById(payload.sub, 'email created_at groups',function(err, user) {

        if (err) return next(err);

        if (!user)
            return res.status(401).send({ message: 'user not found' });

        req.user = user;

        next();
    });
};
