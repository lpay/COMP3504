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
var User = require('../models/user');
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

router.post('/appointments', ensureAuthenticated, function(req, res, next) {
    Group.findById(req.body.group, {'members': {$elemMatch: {user: req.body.member}}})
        .populate('members.user')
        .then(group => {
            var start = moment(req.body.start);
            var end = moment(req.body.end);

            return [group, group.generateTimeslots(start, end, end.diff(start, 'minutes'))];
        })
        .spread((group, result) => {
            /*
            if (result.members.length && result.members[0].timeslots.length) {
                group.members[0].events.push({
                    client: req.user,
                    available: false,
                    start: result.members[0].timeslots[0].start,
                    end: result.members[0].timeslots[0].end
                });

                return group.save();
            }
            */

            if (result.members.length && result.members[0].timeslots.length) {
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
                                start: result.members[0].timeslots[0].start,
                                end: result.members[0].timeslots[0].end
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
    //search.push({'tags': {$regex: new RegExp("/\\b(?:" + req.body.search + ")\b/", "i")}});

    User.find({'name.last': {$regex: new RegExp(req.body.search, "i")}})
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
            var end = req.body.end || moment(start).add(1, 'days');

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