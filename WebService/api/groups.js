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
 * DELETE   /groups/:groupId/members/:memberId         delete a member from a group
 *
 */
var router = require('express').Router();
var Group = require('../models/group');
var User = require('../models/user');
var APIError = require('../errors/APIError');

var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.get('/groups', ensureAuthenticated, function(req, res, next) {
    Group.find({'members.user': req.user})
        .populate('members.user')
        .populate('members.events.client')
        .then(groups => res.send(groups))
        .catch(next);
});

router.post('/groups', ensureAuthenticated, function (req, res, next) {

    // validate request
    if (!req.body.name) return res.status(400).send({message: "name is required"});
    if (!req.body.address) return res.status(400).send({message: "address is required"});
    if (!req.body.city) return res.status(400).send({message: "city is required"});
    if (!req.body.province) return res.status(400).send({message: "province is required"});
    if (!req.body.postalCode) return res.status(400).send({message: "postalCode is required"});

    Group.findOne(
        {
            $or: [
                // verify name is unique
                {name: {$regex: new RegExp('/^' + req.body.name + '$/i')}}
            ]
        })
        .then(existingGroup => {
            if (existingGroup)
                throw new APIError(400, 'group exists');

            var group = new Group({
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                province: req.body.province,
                postalCode: req.body.postalCode,
                contact: req.user.name.first + ' ' + req.user.name.last,
                phone: req.user.phone,
                email: req.user.email,
                members: [{user: req.user, role: 'admin'}],
                defaultAppointmentTypes: [{name: 'Standard', length: 2700}]
            });

            return group.save();
        })
        .then(group => res.status(201).location('/groups/' + group._id).send(group))
        .catch(next);
});

router.get('/groups/:id', ensureAuthenticated, function (req, res, next) {

    if (!req.params.id) return res.status(400).send({message: 'group id required'});

    Group.findById(req.params.id)
        .then(group => {
            if (!group)
                throw new APIError(404, 'group not found');

            res.send(group);
        })
        .catch(next);
});

router.put('/groups/:id', ensureAuthenticated, function(req, res, next) {

    if (!req.params.id) return res.status(400).send({message: 'group id required'});

    Group.findById(req.params.id)
        .then(group => {
            if (!group)
                throw new APIError(404, 'group not found');

            if (!group.isAdmin(req.user))
                throw new APIError(401, 'not authorized');

            // only update fields that were included in the request

            if (req.body.name) group.name = req.body.name;
            if (req.body.address) group.address = req.body.address;
            if (req.body.city) group.city = req.body.city;
            if (req.body.province) group.province = req.body.province;
            if (req.body.postalCode) group.postalCode = req.body.postalCode;

            if (req.body.contact) group.contact = req.body.contact;
            if (req.body.phone) group.phone = req.body.phone;
            if (req.body.email) group.email = req.body.email;

            // allow alpha-numeric characters, remove excess whitespace and add comma delimiter
            // todo: how can we prevent abuse here? cap at 5 words? enforce dictionary words?
            if (req.body.tags) group.tags = req.body.tags.replace(/[^\w\s]+/g, '').replace(/[\s]+/g, ', ');
            
            if (req.body.defaultAvailability) group.defaultAvailability = req.body.defaultAvailability;
            if (req.body.defaultAppointmentTypes) group.defaultAppointmentTypes = req.body.defaultAppointmentTypes;
            if (req.body.defaultInterval) group.defaultInterval = req.body.defaultInterval;

            return group.save();
        })
        .then(group => res.send(group))
        .catch(next);
});

router.delete('/groups/:id', ensureAuthenticated, function(req, res, next) {
    // not implemented
    res.status(501);
});

router.post('/groups/join', ensureAuthenticated, function (req, res, next) {
    Group.findById(req.body.group)
        .then(group => {
            if (!group)
                throw new APIError(404, 'group not found');

            group.members.push({
                user: req.user,
                role: 'member'
            });

            return group.save();
        })
        .then(group => res.send(group))
        .catch(next);
});

router.get('/groups/search/:search', function (req, res, next) {

    if (!req.params.search) return res.status(400).send({message: 'search is required'});

    var search = [];

    search.push({'name': {$regex: new RegExp(req.params.search, "i")}});
    search.push({'tags': {$regex: new RegExp("\\b(?:" + req.params.search + ")\\b", "i")}});

    User.find({'name.last': {$regex: new RegExp("\\b(?:" + req.params.search + ")\\b", "i")}})
        .then(users => {
            if (users.length) {
                var members = [];

                users.forEach(function(user) {
                    members.push({'members.user': user._id});
                });

                search.push({$or: members});
            }

            return Group.find({$or: search}, 'name address city province postalCode contact phone email')
        })
        .then(groups => {res.send(groups)})
        .catch(next);
});

router.put('/groups/:groupId/members/:memberId', ensureAuthenticated, function(req, res, next) {

    if (!req.params.groupId) return res.status(400).send({message: 'group is required'});
    if (!req.params.memberId) return res.status(400).send({message: 'member is required'});

    var update = {};

    if (req.body.appointmentTypes) update['members.$.appointmentTypes'] = req.body.appointmentTypes;
    if (req.body.interval) update['members.$.interval'] = req.body.interval;
    if (req.body.availability) update['members.$.availability'] = req.body.availability;

    return Group.update(
        {
            '_id': req.params.groupId,
            'members': {$elemMatch: {'user': req.params.memberId}}
        }, update, {new: true})
        .then(group => res.send(group))
        .catch(next);
});

router.delete('/groups/:groupId/members/:memberId', ensureAuthenticated, function(req, res, next) {
    // TODO: prevent last group admin from removing themself
    Group.update({_id: req.params.groupId}, {$pull: {'members': {'user': req.params.memberId}}})
        .then(() => { res.send() })
        .catch(next);
});

module.exports = router;