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
//var cookieParser = require('cookie-parser');

//
// Connect to MongoDB
//

mongoose.connect('mongodb://localhost/comp3504');

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

// setup an authorization key for use with jwt
// this method will effectively invalidate any jwt tokens on server restart
crypto.randomBytes(48, function(err, buffer) {
    app.set('authKey', buffer.toString('hex'));
});

//
// API Stubs
//

// TODO: perhaps there is a more modular way to do this (load the entire api with one call?)
app.use('/api', require('./api/user'));
app.use('/api', require('./api/auth'));

//
// Angular Application
//

// serve static files from this directory (assets, css, js, etc)
app.use(express.static('public'));

// default route handler (angular application)
app.get('/', function(request, response) {
    response.sendFile('./public/index.html');
});

//
// Error Handlers
//

// catch 404 and forward to error handler
/*
app.use(function(request, response, next) {
  var err = new Error('not found');
  err.status = 404;
  next(err);
});


// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
      res.status(err.status || 500).json({ error: err, message: err.message });
  });
}

// production error handler
app.use(function(err, req, res) {
  res.status(err.status || 500).json({ error: {}, message: err.message });
});

*/


module.exports = app;
