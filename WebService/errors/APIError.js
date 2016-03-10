/**
 * Created by mark on 3/7/16.
 */

var util = require('util');

var APIError = function(code, message) {
    this.name = this.constructor.name;
    this.code = code || 500;
    this.message = message || "internal server error";

    Error.captureStackTrace(this, this.constructor);
};

util.inherits(APIError, Error);

module.exports = APIError;