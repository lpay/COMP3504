/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 * GET      /groups                     get a list of groups the authenticated user belongs to
 * POST     /groups                     create a new group
 *
 * GET      /groups/:id                 get a group
 * PUT      /groups/:id                 update a group
 * DELETE   /groups/:id                 delete a group
 *
 * POST     /groups/join                joins the authenticated user to a group
 * GET      /groups/search/:search      retrieve a list of groups matching :search
 *
 */
var router = require('express').Router();
var Group = require('../models/group.js');
var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.get('/groups', ensureAuthenticated, function(req, res) {
    Group.find(
        {
            $or: [
                { 'professionals.admins': req.user },
                { 'professionals.users': req.user }
            ]
        })
        .then(groups => res.send(groups));
});

router.get('/groups/:id', ensureAuthenticated, function(req, res){
    Group.findById(req.params.id)
        .then(group => res.send(group));
});

router.post('/groups', ensureAuthenticated, function (req, res, next) {

    // validate request
    if (!req.body.name)
        return res.status(400).send({message: "group name is required"});

    if (!req.body.address)
        return res.status(400).send({message: "group address is required"});

    if (!req.body.city)
        return res.status(400).send({message: "group city is required"});

    Group.findOne({name: {$regex: new RegExp(req.body.name, "i")}}, function (err, existingGroup) {

        if (err) return next(err);

        if (existingGroup)
            return res.status(400).send({message: "group exists"});

        Group.create({
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            province: req.body.province,
            postalCode: req.body.postalCode,
            professionals: {admins: [req.user]}
        }, function (err, group) {

            if (err) return next(err);

            res.status(201).location('/groups/' + group._id).send();
        });
    })
});

router.get('/groups/:id', ensureAuthenticated, function (req, res, next) {

    if (!req.params.id)
        return res.status(400).send({message: 'group id required'});

    Group.findById(req.params.id, function (err, group) {
        if (err) return next(err);

        if (!group)
            return res.status(400).send({message: 'group not found'});
    })
});

router.put('/groups/:id', ensureAuthenticated, function(req, res, next) {
    // not implemented
    res.status(501);
});

router.delete('/groups/:id', ensureAuthenticated, function(req, res, next) {
    // not implemented
    res.status(501);
});


router.post('/groups/join', ensureAuthenticated, function (req, res, next) {
    Group.findById(req.body.group, function (err, group) {

        if (err) return next(err);

        if (!group) return res.status(404).send({error: "GroupNotFound", message: "group not found"});

        if (group.professionals.require_approval) {
            group.professionals.pending.push(req.user);
        } else {
            group.professionals.users.push(req.user);
        }

        group.save(function (err) {

            if (err) return next(err);

            res.status(200).send();
        });
    })

});

router.get('/groups/search/:search', function (req, res, next) {
    var search = {};

    if (req.params.search) {
        search.name = {$regex: new RegExp(req.params.search, "i")}
    }

    Group.find(search, 'name address city province postalCode')
        .then(groups => res.send(groups));
});

module.exports = router;