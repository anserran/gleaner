var ResourceController = require('./resource');
var crypto = require('crypto');

module.exports = function(collection, resources, config) {
	var UserController = function() {
		this.projection = {
			password: 0
		};
		this.rules = {};
	};

	UserController.prototype = new ResourceController(collection);

	/* Override */
	UserController.prototype.processObject = function(object) {
		return this.findOne(req, {
			name: object.name
		}).then(function(user) {
			if (user) throw new HttpError('User name is already taken.', 400);
			object.password = saltAndHash(object.password);
			return object;
		});
	};

	var saltAndHash = function(password) {
		return crypto.createHash('md5').update(password + config.salt).digest('hex');
	};

	return new UserController();
};