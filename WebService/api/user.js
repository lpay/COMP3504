/**
 * Created by mark on 1/14/16.
 *
 * API ENDPOINTS
 *
 * GET      /users          get a list of users
 * GET      /users/:email   get user details
 * PUT      /users/:email   update user details
 * DELETE   /users/:email   delete user details
 *
 */

var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/users')

    /**
     * Get a list of users.
     */
    .get(function(req, res, next) {
        User.find({}, 'email created_at updated_at last_login', function(err, users) {

            if (err) {
                next(err);
                return;
            }

            if (users && users.length > 0) {
                // success
                res.status(200).json(users);
            } else {
                // not found
                res.status(404).json({ error: "UserNoUsers", message: "no users found" });
            }
        });
    });

router.route('/users/:email')

    /**
     * Get user details.
     */
    .get(function(req, res, next) {
        if (req.params.email) {

            User.findOne({ email: req.params.email }, 'email created_at updated_at last_login', function (err, user) {

                if (err) {
                    next(err);
                    return;
                }

                if (user) {
                    res.status(200).json(user);
                } else {
                    res.status(404).json({ error: "UserNotFound", message: "user not found" });
                }
            });
        } else {
            res.status(400).json({ error: "UserBadRequest", message: "email address is required" });
        }
    })

    /**
     * Update user details.
     */
    .put(function(req, res) {
        // not implemented
        res.status(501);
    })

    /**
     * Delete user.
     */
    .delete(function(req, res) {
        // not implemented
        res.status(501);
    });

module.exports = router;
