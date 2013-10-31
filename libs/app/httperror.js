var util = require('util');

var HttpError = function(msg, status, constr) {
	Error.captureStackTrace(this, constr || this);
	this.message = msg || 'Http Error';
	this.status = status;
};

util.inherits(HttpError, Error);

module.exports = HttpError;