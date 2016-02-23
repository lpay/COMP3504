/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 * POST     /groups                    create a new group
 * GET      /groups/:id                get a group
 * PUT      /groups/:id                update a group
 * DELETE   /groups/:id                delete a group
 *
 * POST     /groups/join               joins the authenticated user to a group
 * GET      /groups/search/:search     retrieve a list of groups matching :search
 *
 */

var express = require('express');
var Group = require('../models/group.js');
var ensureAuthenticated = require('../middleware/ensureAuthenticated');

//
// Routes
//

var router = express.Router();

router.post('/groups', ensureAuthenticated, function(req, res, next) {

    // validate request
    if (!req.body.name)
        return res.status(400).send({ message: "group name is required" });

    if (!req.body.address)
        return res.status(400).send({ message: "group address is required" });

    if (!req.body.city)
        return res.status(400).send({ message: "group city is required" });

    Group.findOne({ name: { $regex: new RegExp(req.body.name, "i") } }, function(err, existingGroup) {

        if (err) return next(err);

        if (existingGroup)
            return res.status(400).send({ message: "group exists" });

        Group.create({
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            province: req.body.province,
            postalCode: req.body.postalCode,
            professionals: { admins: [ req.user ] }
        }, function(err, group) {

            if (err) return next(err);

            res.status(201).location('/groups/' + group._id).send();
        });
    })
});

router.get('/groups/:id', ensureAuthenticated, function(req, res, next) {

    if (!req.params.id)
        return res.status(400).send({ message: 'group id required' });

    Group.findById(req.params.id, function(err, group) {
        if (err) return next(err);

        if (!group)
            return res.status(400).send({ message: 'group not found' });
    })
});

router.post('/groups/join', ensureAuthenticated, function(req, res, next) {
    Group.findById(req.body.group, function(err, group) {

        if (err) return next(err);

        if (!group) return res.status(404).send({ error: "GroupNotFound", message: "group not found" });


        if (group.professionals.require_professional_approval) {
            group.professionals.pending.push(req.user);
        } else {
            group.professionals.users.push(req.user);
        }

        group.save(function(err) {

            if (err) return next(err);

            res.status(200).send();
        });
    })

});

router.get('/groups/search/:search', function(req, res, next) {
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

module.exports = router;