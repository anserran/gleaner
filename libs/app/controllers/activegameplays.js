var ResourceController = require('./resource');

module.exports = function(collection, dataStore) {
	var ActiveGamePlays = function(dataStore) {
		this.projection = {
			token: 0
		};
		this.rules = {};
	};
	ActiveGamePlays.prototype = new ResourceController(collection);

	return new ActiveGamePlays();
};