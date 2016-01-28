/**
 * Created by mark on 1/14/16.
 *
 * API ENDPOINTS
 *
 * GET      /users          get a list of users
 * POST     /users          create user
 * GET      /users/:email   get user details
 * PUT      /users/:email   update user details
 * DELETE   /users/:email   delete user details
 *
 */

var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.route('/users')

    /**
     * Get a list of users.
     */
    .get(function(req, res) {
        User.find({}, 'email created_at updated_at last_login', function(err, users) {

            if (err) throw err;

            if (users && users.length > 0) {
                res.status(200).json({ status: "success", data: users });
            } else {
                res.status(404).json({ status: "error", type: "UserNotFound", message: "no users found" });
            }
        });
    })

    /**
     * Create a new user.
     */
    .post(function(req, res) {

        if (req.body.email) {

            // validate email format
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (regex.test(req.body.email)) {

                // validate email uniqueness
                User.findOne({ email: req.body.email }, 'email', function(err, user) {

                    if (err) throw err;

                    if (user) {
                        res.status(400).json({ status: "error", type: "UserDuplicateEmail", message: "email address exists" })
                    } else {
                        // if password is set, create the account, otherwise just perform email validation
                        if (req.body.password) {

                            // TODO: Validate password? (restrictions are probably not a good idea...)

                            // create user
                            var newUser = new User({
                                email: req.body.email,
                                // TODO: encryption of some sort
                                password: req.body.password
                            });

                            newUser.save(function(err) {

                                if (err) throw err;

                                res.status(200).json({ status: "success", reason: "UserCreated" });

                            });
                        } else {
                            res.status(200).json({ status: "success", reason: "UserEmailValid" });
                        }
                    }
                });

            } else {
                res.status(400).json({ status: "error", type: "UserInvalidEmail", message: "invalid email address" });
            }

        } else {
            // Bad request
            res.status(400).json({ status: "error", type: "UserBadRequest", message: "email address is required" });
        }
    });

router.route('/users/:email')

    /**
     * Get user details.
     */
    .get(function(req, res) {
        if (req.params.email) {

            User.findOne({ email: req.params.email }, 'email created_at updated_at last_login', function (err, user) {

                if (err) throw err;

                if (user) {
                    res.status(200).json({status: "success", data: user });
                } else {
                    res.status(404).json({status: "error", type: "UserNotFound", message: "user not found"});
                }
            });
        } else {
            res.status(400).json({ status: "error", type: "UserBadRequest", message: "email address is required" });
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
