/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 *
 * GET      /appointments           get a list of registered appointments for the authenticated user
 * POST     /appointments           book an appointment for the authenticated user
 * PUT      /appointments/:id       update an appointment
 * DELETE   /appointments/:id       delete an appointment
 *
 * GET      /appointments/search    search available appointments
 */

var router = require('express').Router();
var moment = require('moment');
var Promise = require('bluebird');
var Group = require('../models/group');

var APIError = require('../errors/APIError');

var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.get('/appointments', ensureAuthenticated, function(req, res, next) {
    Group.find(
            // search
            {'members.events.client': req.user},
            // projection
            {'members.events': {$elemMatch: {client: req.user}}}
        )
        .then(groups => res.send(groups))
        .catch(next);
});

router.post('/appointments', ensureAuthenticated, function(req, res) {
    Group.findById(req.body.group, {'members': {$elemMatch: {user: req.body.member}}})
        .then(group => {
            return group.generateTimeslots(req.body.start, req.body.end, moment(req.body.end).diff(req.body.start).asMinutes())
        })
        .then(timeslots => {

            if (!timeslots.some(function(timeslot) {
                if (timeslot.start === req.body.start && timeslot.end === req.body.end) {
                    Group.findOneAndUpdate(
                        {'_id': req.body.group, 'members.user': req.body.member},
                        {
                            $push: {
                                'members.$.events': {
                                    client: req.user,
                                    available: false,
                                    start: timeslot.start,
                                    end: timeslot.end
                                }
                            }
                        }
                    ).then(() => {
                        res.send();
                    });

                    return true;
                }
            }))
            {
                throw new Error('requested timeslot is not available');
            }
        })
        .catch(e => res.status(409).send({ message: e }));
});

router.get('/appointments/search', function(req, res, next) {
    var search = {};

    if (req.body.group) search.name = {$regex: new RegExp(req.body.group, "i")};
    if (req.body.slug) search.slug = req.body.slug;

    Group.find(search)
        .populate('members.user')
        .then(groups => {

            var timeslots = [];
            var start = req.body.start || moment();
            var end = req.body.end || moment(start).add(1, 'days');

            // round up to next whole minute
            start.add(1, 'minutes').seconds(0).milliseconds(0);

            // generate timeslots
            groups.forEach(group => {

                var result = group.generateTimeslots(start.clone(), end.clone());

                if (result.totalTimeslots > 0) {
                    timeslots.push({
                        // only expose certain information about the group
                        _id: group._id,

                        slug: group.slug,
                        name: group.name,

                        address: group.address,
                        city: group.city,
                        province: group.province,
                        postalCode: group.postalCode,

                        contact: group.contact,
                        phone: group.phone,
                        email: group.email,

                        startDate: result.startDate,
                        endDate: result.endDate,
                        totalTimeslots: result.totalTimeslots,

                        members: result.members
                    });
                }
            });


            res.send(timeslots);
        })
        .catch(next);
});

module.exports = router;