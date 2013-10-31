var TracesDataStore = function(config, db) {
	var Q = require('q');
	var SHA1 = new(require('jshashes').SHA1)();
	var auth = require('./authenticators');
	var HttpError = require('../app/httperror');

	if (!config.gamePlaySalt) {
		console.log('gamePlaySalt should be defined in the configuration file');
	}

	var gamePlaySalt = config.gamePlaySalt || 'gameplaysalt';

	var startGamePlay = function(req) {
		var gameInstanceToken = req.params && req.params.gameInstanceToken ? req.params.gameInstanceToken : null;

		if (!gameInstanceToken) throw new HttpError('No game instance token specified', 400);

		return db.gameinstances().findOne({
			'token': req.params.gameInstanceToken
		}).then(
			function(gameInstance) {
				// Authenticate
				if (!gameInstance) throw new HttpError('Invalid game instance token', 400);
				if (!gameInstance.enabled) throw new HttpError('Game Instance does not accept new game plays', 403);

				var authenticator = getAuthenticator(gameInstance.authenticator || 'anonymous');
				return Q.when(authenticator.authenticate(req)).then(
					function(playerId) {
						// Insert new game play
						var gamePlay = {
							gameInstance: gameInstance._id,
							player: playerId,
							ip: req.header('x-forwarded-for') || req.connection.remoteAddress
						};
						return db.gameplays().insert(gamePlay).then(
							function(results) {
								// Find some active game with the same properties
								return db.activegameplays().findOne({
									player: playerId,
									gameInstance: gameInstance._id
								}).then(
									function(activeGamePlay) {
										// Generate the game play token. Clients will set this as it authorization header
										var gamePlayToken = SHA1.b64(new Date().toString() + ':' + playerId + ":" + gamePlaySalt + ":" + Math.random());
										// Update active game play
										if (activeGamePlay) {
											return db.activegameplays().update({
												_id: activeGamePlay._id
											}, {
												$set: {
													token: gamePlayToken,
													lastUpdate: new Date(),
													gamePlay: results[0]._id
												}
											});
										} else {
											activeGamePlay = {
												token: gamePlayToken,
												lastUpdate: new Date(),
												gameInstance: gameInstance._id,
												gamePlay: results[0]._id
											};
											return db.activegameplays().insert(activeGamePlay).then(function() {
												return gamePlayToken;
											});
										}
									}
								);
							}
						);
					}
				);
			}
		);
	};

	var getAuthenticator = function(authenticator) {
		switch (authenticator) {
			case 'anonymous':
				return auth.ip;
			case 'eadventure':
				return auth.ead;
			case 'user':
				return auth.user;
			case 'nickname':
				return auth.nickname;
			default:
				return auth.ip;
		}
	};

	var checkToken = function(gamePlayToken) {
		return db.activegameplays().findOne({
			token: gamePlayToken
		}).then(function(activeGamePlay) {
			if (activeGamePlay) {
				return db.activegameplays().update({
					_id: activeGamePlay._id
				}, {
					$set: {
						lastUpdate: new Date()
					}
				}).then(function() {
					return activeGamePlay.gamePlay;
				});
			} else {
				throw new HttpError('Invalid game play token.', 401);
			}
		});
	};

	var addTraces = function(traces, gamePlay) {
		var logicTraces = [];
		var inputTraces = [];
		try {
			for (var i = 0; i < traces.length; i++) {
				var trace = traces[i];
				// Add gamePlay to traces
				trace.gamePlay = gamePlay;
				switch (traces[i].type) {
					case 'logic':
						logicTraces.push(trace);
						break;
					case 'input':
						inputTraces.push(trace);
						break;
					default:
						// FIXME add it to some other table??
						break;
				}
				delete(trace.type);
			}
		} catch (ex) {
			throw new HttpError('', 400);
		}

		var promise = true;
		if (logicTraces.length > 0) {
			promise = db.logictraces().insert(logicTraces);
		}

		if (inputTraces.length > 0) {
			if (promise) {
				promise = promise.then(function() {
					return db.inputtraces().insert(inputTraces);
				});
			} else {
				promise = db.inputtraces().insert(inputTraces);
			}
		}
		return promise;
	};

	var countTraces = function(gamePlay, cb) {
		logictraces.count({
			gamePlay: gamePlay
		}, function(err, count) {
			if (err) {
				cb(err);
			} else {
				inputtraces.count({
					gamePlay: gamePlay
				}, function(err, count2) {
					cb(err, count + count2);
				});
			}
		});
	};

	var removeTraces = function(gamePlays, cb) {
		async.parallel([
			function(callback) {
				logictraces.remove({
					gamePlay: {
						$in: gamePlays
					}
				}, callback);
			},
			function(callback) {
				inputtraces.remove({
					gamePlay: {
						$in: usersessionIds
					}
				}, callback);
			}
		], cb);
	};

	return {
		addTraces: addTraces,
		startGamePlay: startGamePlay,
		checkToken: checkToken,
		countTraces: countTraces,
		removeTraces: removeTraces
	};

};

module.exports = TracesDataStore;