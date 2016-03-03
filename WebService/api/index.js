var router = require('express').Router();

var auth = require('./auth');
var groups = require('./groups');
var users = require('./users');
var events = require('./events');

router.use(auth);
router.use(users);
router.use(groups);
router.use(events);

module.exports = router;