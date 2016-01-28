/**
 * Created by mark on 1/14/19.
 *
 * API ENDPOINTS
 *
 * GET      /auth       validate credentials and generate session token
 */

var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();


var User = require('../models/user');

router.route('/auth')

    .get(function(req, res) {
        if (req.body.email) {
            if (req.body.password) {

                // validate email/password
                User.findOne({ email: req.body.email, password: req.body.password }, function(err, user) {

                    if (err) throw err;

                    if (user) {
                        // generate token
                        var token = jwt.sign(user, 'secret', {
                            expiresInMinutes: 1440
                        });

                        res.status(200).json({ token: token });

                    } else {
                        res.status(400).json({ error: "AuthInvalidCredentials", "message": "invalid email or password" });
                    }
                });

            } else {
                res.status(400).json({ error: "AuthPasswordRequired", "message": "password is required" });
            }
        } else {
            res.status(400).json({ error: "AuthEmailRequired", "message": "email is required" });
        }
    });

module.exports = router;
