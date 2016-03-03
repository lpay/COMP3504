/**
 * Created by mark on 2/3/16.
 *
 *
 * API ENDPOINTS
 *
 * GET      /events     get a list of events
 * POST     /events     create an event
 * PUT      /events     update an event
 *
 */

var router = require('express').Router();
//var Event = require('..models/event');

var ensureAuthenticated = require('../middleware/ensureAuthenticated');


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