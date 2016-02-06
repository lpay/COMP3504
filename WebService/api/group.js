/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 * GET  /groups/:search     retrieve a list of groups matching :search
 */

var express = require('express');
var Group = require('../models/group.js');
var ensureAuthenticated = require('./middleware').ensureAuthenticated;

//
// Routes
//

var router = express.Router();

router.get('/groups/:search', function(req, res, next) {
    var search = {};

    if (req.params.search) {
        search.name = { $regex: new RegExp(req.params.search, "i") }
    }

    Group.find(search, 'name address city province postalCode', function(err, groups) {

        if (err)
            return next(err);

        if (groups && groups.length > 0) {
            res.send(groups);
        } else {
            res.status(404).send({ error: "GroupNoGroups", message: "no groups found" });
        }

    });
});

router.post('/groups', ensureAuthenticated, function(req, res, next) {

    // validate request
    if (!req.body.name)
        return res.status(400).send({ error: "GroupNameRequired", message: "group name is required" });

    if (!req.body.address)
        return res.status(400).send({ error: "GroupAddressRequired", message: "group address is required" });

    if (!req.body.city)
        res.status(400).send({ error: "GroupCityRequired", message: "group city is required" });

    Group.findOne({ name: { $regex: new RegExp(req.body.name, "i") } }, function(err, existingGroup) {

        if (err) return next(err);

        if (existingGroup)
            return res.status(400).send({ error: "GroupExists", message: "group exists" });

        Group.create({
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            province: req.body.province,
            postalCode: req.body.postalCode,
            admins: [ req.user ]
        }, function(err, group) {

            if (err) return next(err);

            req.user.groups.push(group);

            req.user.save(function(err, user) {

                if (err)
                    return next(err);

                res.send(user);
            });
        });
    })
});

router.post('/groups/join', ensureAuthenticated, function(req, res, next) {
    Group.findById(req.body.group, function(err, group) {

        if (err)
            return next(err);

        if (!group)
            return res.status(404).send({ error: "GroupNotFound", message: "group not found" });

        group.users.push(req.user);

        group.save(function(err) {

            if (err)
                return next(err);

            req.user.groups.push(group);

            req.user.save(function(err, user) {

                if (err)
                    return next(err);

                res.send(user);
            });
        });
    })

});

module.exports = router;