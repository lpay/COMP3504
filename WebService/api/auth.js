/**
 * Created by mark on 1/14/19.
 *
 * API ENDPOINTS
 *
 * POST /auth/login     validate credentials and generate session token
 */

var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.route('/auth/login')

    .post(function(req, res) {
        if (req.body.email) {
            if (req.body.password) {
                User.findOne({ "email": req.body.email, "password": req.body.password }, function(err, user) {
                   if (err) throw err;

                    if (user) {
                        // generate token

                        res.status(200).json({ "status": "success", "data": { "token": "???" } });

                    } else {
                        res.status(400).json({ "status": "error", "reason": "AuthInvalidCredentials", "message": "invalid username or password" });
                    }
                });

            } else {
                res.status(400).json({ "status": "error", "reason": "AuthPasswordRequired", "message": "password is required" });
            }
        } else {
            res.status(400).json({ "status": "error", "reason": "AuthUserRequired", "message": "username is required" });
        }
    });
