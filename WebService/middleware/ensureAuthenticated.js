/**
 * Create by mark on 2/3/16.
 *
 */

var moment = require('moment');
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../models/user');

module.exports = function(req, res, next) {

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

    User.findById(payload.sub, 'email')
        .then(user => {
            if (!user)
                return res.status(401).send({ message: 'user not found' });

            req.user = user;

            next();
        });
};
