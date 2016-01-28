/**
 * Created by mark on 1/14/16.
 */

// libraries
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// connect to database
mongoose.connect('mongodb://localhost/comp3504');

// express application
var app = express();

// static file location (angular app location)
app.use(express.static('public'));

// log every request
app.use(morgan('dev'));

// set favicon location
app.use(favicon('./public/assets/images/favicon.ico'));

// parse application/json in requests
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded in requests
app.use(bodyParser.urlencoded({ extended: true }));

// session cookies
app.use(cookieParser());

// api stub
app.use('/api', require('./api/user'));
app.use('/api', require('./api/auth'));

// default route (angular app)
app.get('/', function(request, response) {
    response.sendFile('./public/index.html');
});


// catch 404 and forward to error handler
app.use(function(request, response, next) {
  var error = new Error('Resource Not Found');
  error.status = 404;
  next(err);
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500).json({ error: err, message: err.message });
  });
}

// production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({ error: {}, message: err.message });
});


module.exports = app;
