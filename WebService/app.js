/**
 * Created by mark on 1/14/16.
 *
 */

//
// Modules
//

var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var cors = require('cors');

var APIError = require('./errors/APIError');

//var cookieParser = require('cookie-parser');

//
// MongoDB
//

mongoose.connect('mongodb://localhost/comp3504');
mongoose.Promise = require('bluebird');

//
// Express
//

var app = express();

// log all requests
app.use(morgan('dev'));

// set favicon location
app.use(favicon('./public/assets/images/favicon.ico'));

// accept application/json in requests
app.use(bodyParser.json());

// accept application/x-www-form-urlencoded in requests
app.use(bodyParser.urlencoded({ extended: true }));

// enable cors
app.use(cors());

//
// Load API
//

app.use('/', require('./api'));

//
// Angular Application
//

// serve static files from this directory (assets, css, js, etc)
app.use(express.static('public'));

// default route handler (angular application)
app.get('/', function(req, res) {
    res.sendFile('./public/index.html');
});

app.use(function(err, req, res) {

    console.log(err);

    if (err instanceof APIError) {
        res.status(err.code).send(err.message);
    } else {
        res.status(500).send({message: 'internal server error'});
    }
});

module.exports = app;
