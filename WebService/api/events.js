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


var ensureAuthenticated = require('../middleware/ensureAuthenticated');

router.post('/events', ensureAuthenticated, function(req, res) {
    console.log(req.body.title);
});

module.exports = router;