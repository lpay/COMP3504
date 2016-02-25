var router = require('express').Router();

var auth = require('./auth');
var groups = require('./groups');
var users = require('./users');

router.use(auth);
router.use(users);
router.use(groups);

module.exports = router;