var ResourceController = require('./resource');
var ObjectID = require('mongodb').ObjectID;
var Q = require('q');
var HttpError = require('../httperror');

module.exports = function(collection, resources) {
	var GameInstanceController = function() {
		this.projection = {};
		this.rules = {
			name: {
				minlength: 2,
				required: true
			},
			token: {
				minlength: 6,
				required: true
			}
		};
	};

	GameInstanceController.prototype = new ResourceController(collection);

	/* Override */
	GameInstanceController.prototype.processObject = function(gameInstance) {
		try {
			if (typeof gameInstance.game === 'string') {
				gameInstance.game = new ObjectID(gameInstance.game);
			}
		} catch (err) {
			return Q.fcall(function() {
				throw new HttpError('Invalid game id', 400);
			});
		}
		return resources.getObjectById('games', gameInstance.game)
			.then(function(game) {
				if (!game) throw new HttpError('The game for the game instance does not exist', 400);
				gameInstance.enabled = gameInstance.enabled || false;
				gameInstance.authentication = gameInstance.authentication || 'anonymous';
				return gameInstance;
			});
	};

	/* Override */
	GameInstanceController.prototype.removeRelated = function(query) {
		return this.list(query).then(function(gameInstances) {
			var ids = [];
			gameInstances.forEach(function(gameInstance) {
				ids.push(gameInstance._id);
			});
			return resources.remove('activegameplays', {
				gameInstance: {
					$in: ids
				}
			}).then(function() {
				return resources.remove('gameplays', {
					gameInstance: {
						$in: ids
					}
				});
			});
		});
	};

	return new GameInstanceController();
};