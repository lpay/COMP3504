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
 * GET      /appointments/:id       get an appointment
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

router.post('/events', ensureAuthenticated, function(req, res, next) {

    // validate request
    if (!req.body.group) return res.status(400).send({message: 'group is required'});
    if (!req.body.member) return res.status(400).send({message: 'member is required'});

    var event = {
        title: req.body.title,
        notes: req.body.notes,
        start: req.body.start,
        end: req.body.end,
        available: req.body.available,
        client: req.body.client
    };

    Group.update(
        {
            '_id': req.body.group,
            'members': {$elemMatch: {user: req.body.member}}
        },
        {
            $push: {
                'members.$.events': event
            }
        })
        .then(() => res.status(201).send())
        .catch(next);
});

router.put('/events', ensureAuthenticated, function(req, res, next) {

});

router.delete('/events/:id', ensureAuthenticated, function(req, res, next) {

    if (!req.params.id) return res.status(400).send({message: 'id is required'});

    Group.update({'members.events._id': req.params.id}, {$pull: {'members.$.events': {_id: req.params.id}}})
        .then(() => res.send())
        .catch(next);
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
            'id': '$members.events._id',
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
            'title': '$members.events.title'
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

    if (!req.body.group) return res.status(400).send({message: 'group is required'});
    if (!req.body.member) return res.status(400).send({message: 'member is required'});

    Group.findById(req.body.group, {'members': {$elemMatch: {user: req.body.member}}})
        .populate('members.user')
        .then(group => {
            var start = moment(req.body.start);
            var end = moment(req.body.end);

            return group.generateTimeslots(start, end, {name: req.body.type, length: end.diff(start, 'seconds')}, 1);
        })
        .then(timeslots => {
            if (timeslots.length == 1) {
                var timeslot = timeslots[0];

                return Group.update(
                    {
                        '_id': req.body.group,
                        'members': {$elemMatch: {user: req.body.member}}
                    },
                    {
                        $push: {
                            'members.$.events': {
                                client: req.user,
                                available: false,
                                start: timeslot.start,
                                end: timeslot.end,
                                title: timeslot.type
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

    if (!req.body.group) return res.status(400).send({message: 'group is required'});

    Group.findById(req.body.group)
        .populate('members.user')
        .then(group => {
            var start = req.body.start ? moment(req.body.start) : moment();

            if (start < moment())
                start = moment();

            var end = req.body.end || moment(start).endOf('day');

            // round up to next whole minute
            if (start.seconds() > 0 || start.milliseconds() > 0)
                start.add(1, 'minutes').seconds(0).milliseconds(0);

            res.send(group.generateTimeslots(start, end));
        })
        .catch(next);
});

module.exports = router;