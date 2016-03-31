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
var Group = require('../models/group');
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

            return Group.create({
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                province: req.body.province,
                postalCode: req.body.postalCode,
                contact: req.user.name.first + ' ' + req.user.name.last,
                phone: req.user.phone,
                email: req.user.email,
                members: [{user: req.user, role: 'admin'}]
            });
        })
        .then(group => res.status(201).location('/groups/' + group._id).send())
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
            var update = {};

            if (req.body.name) update.name = req.body.name;
            if (req.body.address) update.address = req.body.address;
            if (req.body.city) update.city = req.body.city;
            if (req.body.province) update.province = req.body.province;
            if (req.body.postalCode) update.postalCode = req.body.postalCode;

            if (req.body.contact) update.contact = req.body.contact;
            if (req.body.phone) update.phone = req.body.phone;
            if (req.body.email) update.email = req.body.email;

            // allow alpha-numeric characters, remove excess whitespace and add comma delimiter
            // todo: how can we prevent abuse here? cap at 5 words? enforce dictionary words?
            if (req.body.tags) update.tags = req.body.tags.replace(/[^\w\s]+/g, '').replace(/[\s]+/g, ', ');
            
            if (req.body.defaultAvailability) update.defaultAvailability = req.body.defaultAvailability;
            if (req.body.defaultAppointments) update.defaultAppointments = req.body.defaultAppointments;
            if (req.body.defaultInterval) update.defaultInterval = req.body.defaultInterval;

            return Group.findByIdAndUpdate(req.params.id, update, {new: true});
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
                role: 'professional'
            });

            return group.save();
        })
        .then(group => res.status(200).send())
        .catch(next);
});

router.get('/groups/search/:search', function (req, res, next) {
    var search = {};

    if (req.params.search) {
        search.name = {$regex: new RegExp(req.params.search, "i")}
        search.tags = {$regex: new RegExp(req.params.search, "i")}
    }

    Group.find(search, 'name address city province postalCode')
        .then(groups => res.send(groups))
        .catch(next);
});

module.exports = router;