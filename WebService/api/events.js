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
var Group = require('../models/group');

var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.get('/appointments', ensureAuthenticated, function(req, res) {
    Group.find(
        // search
        {
            'members.events.client': req.user
        },
        // projection
        {
            'members.events': {$elemMatch: {client: req.user}}
        })
        .then(groups => res.send(groups));
});

router.get('/appointments/search', function(req, res) {
    var search = {};

    if (req.body.group) search.name = {$regex: new RegExp(req.body.group, "i")};
    if (req.body.slug) search.slug = req.body.slug;

    Group.find(search)
        .then(groups => {
            var start = req.body.start || moment();
            var end = req.body.end || moment(start).add(1, 'days');

            groups.forEach(function(group) {
                group.generateTimeslots(start, end)
                    .then(timeslots => res.send(timeslots));
            });
        });
});



router.get('/events/:search', function(req, res) {
    console.log(req.params.search);

    res.send([
        {firstName: 'Alex', lastName: 'Adams'},
        {firstName: 'Bobby', lastName: 'Brown'},
        {firstName: 'Candice', lastName: 'Candy'},
        {firstName: 'Dominique', lastName: 'Donald'},
        {firstName: 'Erin', lastName: 'Early'},
        {firstName: 'Frank', lastName: 'Folly'},
        {firstName: 'Heather', lastName: 'Holly'},
        {firstName: 'Igor', lastName: 'Ionoff'},
        {firstName: 'Johnny', lastName: 'Johnson'},
        {firstName: 'Katie', lastName: 'Knight'},
        {firstName: 'Leena', lastName: 'Little'},
        {firstName: 'Mary', lastName: 'Mary'},
        {firstName: 'Rosie', lastName: 'Remaglia'},
        {firstName: 'Sammy', lastName: 'Sosa'},
        {firstName: 'Tiger', lastName: 'Tanner'},
        {firstName: 'Unser', lastName: 'Unow'},
        {firstName: 'Victoria', lastName: 'Vee'},
        {firstName: 'Ura', lastName: 'Fuquad'}
    ]);
});

router.post('/events', ensureAuthenticated, function(req, res) {
    console.log(req.body.title);
});


module.exports = router;