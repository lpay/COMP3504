/**
 * Created by mark on 1/14/16.
 *
 * API ENDPOINTS
 *
 * GET      /profile        get authenticated user's details
 * PUT      /profile        set authenticated user's details
 *
 * GET      /users          get a list of users
 *
 * GET      /users/:id   get user details
 * PUT      /users/:id   update user details
 * DELETE   /users/:id   delete user
 *
 */

var router = require('express').Router();
var ensureAuthenticated = require('../middleware/ensureAuthenticated');
var User = require('../models/user');
var APIError = require('../errors/APIError');

/**
 * Get profile of authenticated user.
 */
router.get('/profile', ensureAuthenticated, function(req, res, next) {
    User.findById(req.user)
        .then(user => res.send(user))
        .catch(next);
});

/**
 * Get a list of users.
 */
router.get('/users', function (req, res, next) {
    User.find({}, 'email created_at updated_at last_login')
        .then(users => {
            if (!users.length)
                throw new APIError(404, 'no users found');

            return res.send(users);
        })
        .catch(next);
});

router.route('/users/:id')

    /**
     * Get user details.
     */
    .get(function(req, res) {
        // not implemented
        res.status(501);
    })

    /**
     * Update user details.
     */
    .put(ensureAuthenticated, function(req, res, next) {

        if (!req.params.id) return res.status(400).send({message: 'user is required'});

        if (req.params.id != req.user._id)
            return res.status(403).send({message: 'not authorized'});

        var update = {};

        if (req.body.name) update['name'] = req.body.name;
        if (req.body.email) update['eamil'] = req.body.email;
        if (req.body.password) update['password'] = req.body.password;

        return User.update(req.params.id, update)
            .then(() => res.send())
            .catch(next);
    })

    /**
     * Delete user.
     */
    .delete(function (req, res) {
        // not implemented
        res.status(501);
    });

module.exports = router;