/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 * GET      /events                 get a list of events for the authenticated user
 * POST     /events                 create a new event
 * PUT      /events/:id             update an event
 * DELETE   /events/:id             delete an event
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
var User = require('../models/user');
var Group = require('../models/group');

var APIError = require('../errors/APIError');

var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.get('/events', ensureAuthenticated, function(req, res, next) {
    
});

router.get('/appointments', ensureAuthenticated, function(req, res, next) {

    var date = new Date();

    Group.aggregate([
        // limit initial list of groups
        {$match: {
            $and: [
                {'members.events.client': req.user._id},
                {'members.events.start': {$gt: date}}
            ]
        }},

        // unwind members
        {$unwind: '$members'},

        // unwind events
        {$unwind: '$members.events'},

        // filter members.events
        {$match: {
            $and: [
                {'members.events.client': req.user._id},
                {'members.events.start': {$gt: date}}
            ]
        }},

        // projection
        // only expose minimal information, and un-nest members.user & members.events
        {$project: {
            'name': true,
            'address': true,
            'city': true,
            'province': true,
            'postalCode': true,

            'contact': true,
            'phone': true,
            'email': true,

            'member': '$members.user',

            'start': '$members.events.start',
            'end': '$members.events.end',
            'type': '$members.events.type'
        }},

        // sort by date
        {$sort: {'event.start': 1}}


        /*

        {$project: {

            'name': 1,
            'address': 1,
            'city': 1,
            'province': 1,
            'postalCode': 1,

            'contact': 1,
            'phone': 1,
            'email': 1,

            'member': {
                $filter: {
                    'input': {
                        $map: {
                            'input': '$members',
                            'as': 'member',
                            'in': {
                                'user': '$$member.user',
                                'event': {
                                    $filter: {
                                        'input': '$$member.events',
                                        'as': 'event',
                                        'cond': {
                                            $and: [
                                                {$eq: ['$$event.client', req.user._id]},
                                                {$gt: ['$$event.start', date]}
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    'as': 'member',
                    'cond': {$gt: [{$size: '$$member.event'}, 0]}
                }
            },
        }},
        {$unwind: '$member'},
        {$unwind: '$member.event'},
        {$sort: {'member.event.start': 1}}
        */
    ])
    .exec()
    .then(groups => Group.populate(groups, {path: 'member', model: User, select: 'name'}))
    .then(groups => res.send(groups))
    .catch(next);
});

router.post('/appointments', ensureAuthenticated, function(req, res, next) {

    if (!req.body.appointment) return res.status(400).send({message: 'appointment is required'});

    Group.findById(req.body.appointment.group, {'members': {$elemMatch: {user: req.body.appointment.member}}})
        .populate('members.user')
        .then(group => {
            var start = moment(req.body.appointment.start);
            var end = moment(req.body.appointment.end);

            return group.generateTimeslots(start, end, { name: req.body.appointment.type, length: end.diff(start, 'seconds') }, 1);
        })
        .then(result => {
            if (result.members.length && result.members[0].timeslots.length) {
                return Group.update(
                    {
                        '_id': req.body.appointment.group,
                        'members': {$elemMatch: {user: req.body.appointment.member}}
                    },
                    {
                        $push: {
                            'members.$.events': {
                                client: req.user,
                                available: false,
                                start: result.members[0].timeslots[0].start,
                                end: result.members[0].timeslots[0].end,
                                type: result.members[0].timeslots[0].type
                            }
                        }
                });
            }

            throw new APIError(409, 'requested timeslot is not available');
        })
        .then(() => res.send())
        .catch(next);
});

router.post('/appointments/search', function(req, res, next) {

    if (!req.body.search) return res.status(400).send({message: 'search is required'});

    var search = [];

    search.push({'name': {$regex: new RegExp(req.body.search, "i")}});
    search.push({'tags': {$regex: new RegExp("\\b(?:" + req.body.search + ")\\b", "i")}});

    User.find({'name.last': {$regex: new RegExp("\\b(?:" + req.body.search + ")\\b", "i")}})
        .then(users => {
            if (users.length) {
                var members = [];

                users.forEach(function(user) {
                    members.push({'members.user': user});
                });

                search.push({ $or: members });
            }

            return Group.find({$or: search }).populate('members.user');
        })
        .then(groups => {
            var timeslots = [];

            var start = req.body.start ? moment(req.body.start) : moment();
            var end = req.body.end || moment(start).endOf('day');

            // round up to next whole minute
            if (start.seconds() > 0 || start.milliseconds() > 0)
                start.add(1, 'minutes').seconds(0).milliseconds(0);

            // generate timeslots
            groups.forEach(function(group) {
                var result = group.generateTimeslots(start, end);

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