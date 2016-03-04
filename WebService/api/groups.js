/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 * GET      /groups                     get a list of groups the authenticated user belongs to
 * POST     /groups                     create a new group
 *
 * GET      /groups/:slug               get a group
 * PUT      /groups/:slug               update a group
 * DELETE   /groups/:slug               delete a group
 *
 * POST     /groups/join                joins the authenticated user to a group
 * GET      /groups/search/:search      retrieve a list of groups matching :search
 *
 */
var router = require('express').Router();
var slugify = require('slug');
var Group = require('../models/group');

var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.get('/groups', ensureAuthenticated, function(req, res) {
    Group.find({'members.user': req.user})
        .populate('members.user')
        .populate('members.events.client')
        .then(groups => res.send(groups));
});

router.post('/groups', ensureAuthenticated, function (req, res) {

    // validate request
    if (!req.body.name) return res.status(400).send({message: "name is required"});
    if (!req.body.address) return res.status(400).send({message: "address is required"});
    if (!req.body.city) return res.status(400).send({message: "city is required"});
    if (!req.body.province) return res.status(400).send({message: "province is required"});
    if (!req.body.postalCode) return res.status(400).send({message: "postalCode is required"});

    var slug = slugify(req.body.name, { lower: true });

    Group.findOne(
        {
            $or: [
                {name: {$regex: new RegExp(req.body.name, "i")}},
                {slug: slug}
            ]
        })
        .then(existingGroup => {
            if (existingGroup)
                throw new Error("group exists");

            return Group.create({
                slug: slug,
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                province: req.body.province,
                postalCode: req.body.postalCode,
                contact: req.user.name,
                phone: req.user.phone,
                email: req.user.email,
                members: [{user: req.user, role: 'admin'}]
            });
        })
        .then(group => res.status(201).location('/groups/' + group.slug).send())
        .catch(Error, e => res.status(400).send({message: e.message}));
});

router.get('/groups/:slug', ensureAuthenticated, function (req, res) {

    if (!req.params.slug) return res.status(400).send({message: 'group slug required'});

    Group.findOne({ slug: req.params.slug })
        .then(group => {
            if (!group)
                throw new Error('group not found');

            res.send(group);
        })
        .catch(Error, e => res.status(404).send({message: e.message}));
});

router.put('/groups/:slug', ensureAuthenticated, function(req, res) {

    Group.findOne({ slug: req.params.slug })
        .then(group => {
            if (!group)
                throw new Error('group not found');

            return group.isAdmin(req.user);
        })
        .then(admin => {
            if (!admin)
                throw new Error('not authorized');

            return Group.findOneAndUpdate({ slug: req.params.slug }, {
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                province: req.body.province,
                postalCode: req.body.postalCode,
                contact: req.body.name,
                phone: req.body.phone,
                email: req.body.email
                //defaultAvailability: req.body.hoursOfOperation
            });
        })
        .then( () => res.send() );
});

router.delete('/groups/:slug', ensureAuthenticated, function(req, res) {
    // not implemented
    res.status(501);
});


router.post('/groups/join', ensureAuthenticated, function (req, res) {
    Group.findById(req.body.group)
        .then(group => {
            if (!group)
                throw new Error('group not found');

            if (group.professionals.require_approval) {
                group.professionals.pending.push(req.user);
            } else {
                group.professionals.users.push(req.user);
            }

            return group.save();
        })
        .then(group => res.status(200).send());
});

router.get('/groups/search/:search', function (req, res) {
    var search = {};

    if (req.params.search) {
        search.name = {$regex: new RegExp(req.params.search, "i")}
    }

    Group.find(search, 'name address city province postalCode')
        .then(groups => res.send(groups));
});

module.exports = router;