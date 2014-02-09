/**
 * Class in charge of processing all requests sending traces.
 * Configuration must be in the form:
 * {
 *		salt: 'game-play-salt' // Salt to generate game play tokens
 * }
 *
 * @class GleanerCollector
 * @constructor
 * @param {Object} config Collector config
 * @param {Object} db the database
 */
var GleanerCollector = function(config, db) {
	var Q = require('q');
	// Traces data store
	var traces = new require('./tracesds.js')(config, db);

	/**
	 * Starts a game play
	 * @method start
	 * @param  {Object} req the request object. It must contain a valid game instance key as a param
	 * @param  {Object} res the response object. A 401 status code will be sent if something goes wrong, a 200 if authentication succeeded.
	 */
	var start = function(req, res) {
		return Q.fcall(function() {
			return traces.startGamePlay(req);
		}).then(function(gamePlayToken) {
			console.log('Start tracking ' + gamePlayToken);
			res.status(200);
			res.send({
				gamePlayToken: gamePlayToken
			});
			return gamePlayToken;
		}).fail(function(err) {
			console.log('Error starting track');
			if (err.status) {
				res.status(err.status);
				res.send(err.message);
			} else {
				console.log(err.stack);
				// If status is not set, probably is an internal server error
				res.send(500);
			}
			throw err;
		});
	};

	/**
	 * Stores the received traces
	 * @method track
	 * @param  {Object} req the request object. It must contain a body with valid traces is JSON
	 * @param  {Object} res the response object. A 400 status code will be sent if something goes wrong, a 204 otherwise
	 */
	var track = function(req, res) {
		var gamePlayToken = req.headers && req.headers.authorization ? req.headers.authorization : null;
		return traces.checkToken(gamePlayToken)
			.then(function(gamePlay) {
				if (req.body && req.body.length > 0) {
					return traces.addTraces(req.body, gamePlay).then(function() {
						res.send(204);
						return true;
					});
				} else {
					res.send(204);
				}
				return true;
			}).fail(function(err) {
				if (err.status) {
					res.status(err.status);
					res.send(err.message);
				} else {
					// If status is not set, probably is an internal server error
					res.send(500);
				}
				throw err;
			});
	};

	/**
	 * Counts the number of traces for a given game play
	 * @method countTraces
	 * @param  {Object}   gamePlay id
	 * @param  {Function} cb callback with error and count
	 */
	var countTraces = function(gamePlay, cb) {
		traces.countTraces(gamePlay, cb);
	};


	/**
	 * Removes the traces associated with the given game play
	 * @method removeTraces
	 * @param  {Object}   gamePlay id
	 * @param  {Function} cb callback with error
	 */
	var removeTraces = function(gamePlay, cb) {
		traces.removeTraces(gamePlay, cb);
	};

	return {
		start: start,
		track: track,
		countTraces: countTraces,
		removeTraces: removeTraces
	};
};

module.exports = GleanerCollector;