var ResourceController = require('./resource');

module.exports = function(collection, dataStore) {
	var LogicTracesController = function() {
		this.projection = {};
		this.rules = {};
	};

	LogicTracesController.prototype = new ResourceController(collection);
	return new LogicTracesController();
};