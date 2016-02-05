/**
 * Create by mark on 2/3/16.
 *
 */

var jwt = require('jsonwebtoken');
var User = require('../models/user');

exports.ensureAuthenticated = function(req, res, next) {

    if (!req.headers.authorization)
        return res.status(401).send({ message: 'authorization required' });

    var token = req.headers.authorization.split(' ')[1];

    var payload = null;

    try {
        payload = jwt.decode(token, req.app.get('authKey'));
    } catch (err) {
        return res.status(401).send({ message: err.message });
    }

    User.findById(payload.sub, function(err, user) {

        if (err) return next(err);

        if (!user)
            return res.status(401).send({ message: 'user not found' });

        req.user = user;
        next();
    });
};
