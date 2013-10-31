var HttpError = require('./httperror');
var Q = require('q');

module.exports = function(db, config) {

	var resourceTypes = ['games', 'gameinstances', 'gameplays', 'activegameplays', 'users', 'logictraces', 'inputtraces'];
	var controllers = {};

	function getTypeController(type) {
		console.log('Get controller ' + controllers[type]);
		var deferred = Q.defer();
		var controller = controllers[type];
		if (!controller) deferred.reject(new HttpError('Invalid resource type ' + type, 400));
		deferred.resolve(controller);
		return deferred.promise;
	}

	var resources = {

		list: function(type, query) {
			return getTypeController(type).then(function(controller) {
				return controller.list(query);
			});
		},

		getObjectById: function(type, id) {
			return getTypeController(type).then(function(controller) {
				return controller.getObjectById(id);
			});
		},

		add: function(type, object) {
			return getTypeController(type).then(function(controller) {
				console.log('Adding ' + JSON.stringify(object));
				return controller.add(object);
			});
		},

		remove: function(type, query) {
			return getTypeController(type).then(function(controller) {
				return controller.remove(query);
			});
		},

		removeById: function(type, id) {
			return this.remove(type, {
				_id: id
			});
		},

		update: function(type, id, object) {
			return getTypeController(type).then(function(controller) {
				console.log('Updating...');
				return controller.update(id, object);
			});
		},

		count: function(type, query) {
			return getTypeController(type).then(function(controller) {
				return controller.count(query);
			});
		}
	};

	// Initiate controllers
	for (var i = 0; i < resourceTypes.length; i++) {
		var type = resourceTypes[i];
		controllers[type] = require('./controllers/' + type)(db.collection(type), resources, config);
	}

	console.log('Resources initiated ' + JSON.stringify(controllers));

	return resources;
};