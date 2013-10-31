var ResourceController = require('./resource');
var Q = require('q');
var ObjectID = require('mongodb').ObjectID;

module.exports = function(collection, resources) {
	var GameControllers = function() {
		this.projection = {};
		this.rules = {
			title: {
				minlength: 2,
				required: true
			}
		};
	};

	GameControllers.prototype = new ResourceController(collection);

	/* Override */
	GameControllers.prototype.removeRelated = function(query) {
		return this.list(query).then(function(games) {
			var ids = [];
			games.forEach(function(game) {
				ids.push(game._id);
			});
			return resources.remove('gameinstances', {
				game: {
					$in: ids
				}
			});
		});
	};

	return new GameControllers();
};