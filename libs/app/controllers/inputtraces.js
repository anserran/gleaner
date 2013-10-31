var ResourceController = require('./resource');

module.exports = function(collection, dataStore) {
	var InputTracesController = function() {
		this.projection = {};
		this.rules = {};
	};

	InputTracesController.prototype = new ResourceController(collection);
	return new InputTracesController();
};