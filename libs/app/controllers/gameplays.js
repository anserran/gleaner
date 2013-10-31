var ResourceController = require('./resource');

module.exports = function(collection, resources) {
	var GamePlays = function() {
		this.projection = {};
		this.rules = {};
	};

	GamePlays.prototype = new ResourceController(collection);

	/* Override */
	GamePlays.prototype.removeRelated = function(query) {
		return this.list(query).then(function(gamePlays) {
			var ids = [];
			gamePlays.forEach(function(gamePlay) {
				ids.push(gamePlay._id);
			});
			return resources.remove('logictraces', {
				gamePlay: {
					$in: ids
				}
			}).then(function() {
				return resources.remove('inputtraces', {
					gamePlay: {
						$in: ids
					}
				});
			});
		});
	};

	return new GamePlays();

};