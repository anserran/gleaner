var db;
var collector;
var Q = require('q');
var config = {
	mongoHost: 'localhost',
	mongoPort: 27017,
	dbName: 'test'
};
Q.longStackSupport = true;

var q = function(promise) {
	return function() {
		return promise;
	};
};

// Mock classes
var Response = function() {
	this.statusValue = 0;
	this.status = function(status) {
		if (status) {
			this.statusValue = status;
		}
		return this.statusValue;
	};
	this.send = function(data) {
		this.data = data;
		if (typeof data === 'number') {
			this.statusValue = data;
		}
	};
};

var Request = function(headers) {
	this.headers = headers;
	this.header = function(name) {
		return this.headers[name];
	};
	this.connection = {
		remoteAddress: '127.0.0.1'
	};
};

module.exports = {
	setUp: function(cb) {
		db = new require('../libs/db/db')(config);
		collector = new require('../libs/collector/gleanerCollector')(config, db);
		console.log('Setting up tests');
		db.connect().done(function() {
			cb();
		});
	},
	tearDown: function(cb) {
		db.disconnect().done(function() {
			cb();
		});
	},
	testConnection: function(test) {
		console.log('Testing connection');
		db.connect().then(function() {
			test.expect(1);
			test.ok(db.isConnected(), 'Not connected.');
			test.done();
		}).fail(function(err) {
			console.log(err);
			test.ok(false, err);
			test.done();
		});
	},
	testStart: function(test) {
		test.expect(15);
		var req = new Request({
			authorization: 'anonymous'
		});
		var res = new Response();
		var gamePlayToken;
		db.games().remove()
			.then(q(db.gameinstances().remove()))
			.then(q(db.gameplays().remove()))
			.then(q(db.activegameplays().remove()))
			.then(q(db.logictraces().remove()))
			.then(q(db.inputtraces().remove()))
			.then(q(db.gameplays().count()))
			.then(function(count) {
				console.log('0. Checking game plays is empty');
				test.strictEqual(0, count);
			})
			.then(q(collector.start(req, res)))
			.fail(function(err) {
				console.log('1. Start tracking failed');
				test.strictEqual(400, err.status);
				test.strictEqual(400, res.status());
			})
			.then(q(db.games().insert({
				_id: 0,
				title: 'Test Game'
			})))
			.then(function() {
				return db.games().count();
			})
			.then(function(count) {
				console.log('2. Checking games count');
				test.strictEqual(1, count, 'Game count incorrect');
			})
			.then(q(db.gameinstances().insert({
				game: 0,
				token: '000',
				enabled: false,
				authentication: 'anonymous'
			})))
			.then(q(db.gameinstances().count()))
			.then(function(count) {
				console.log('3. Checking game instances count');
				test.strictEqual(1, count, 'Game Instances count incorrect');
			})
			.then(function() {
				console.log('4. Setting game instance token');
				req.params = {
					gameInstanceToken: '000'
				};
				return collector.start(req, res);
			})
			.fail(function(err) {
				console.log('5. ' + err.message);
				test.strictEqual(403, err.status);
				test.strictEqual(403, res.status());
			})
			.then(function() {
				console.log('6. Enabling game instance');
				return db.gameinstances().update({
					token: '000'
				}, {
					$set: {
						enabled: true
					}
				});
			})
			.then(function() {
				console.log('7. Start tracking');
				return collector.start(req, res);
			})
			.then(function(value) {
				test.ok(value, 'Tracking not started');
				gamePlayToken = res.data.gamePlayToken;
				console.log('8. Game Play Token received ' + gamePlayToken);
				console.log('9. Sending traces (without authentication)');
				req.body = [{
					type: 'logic',
					event: 'test'
				}];
				return collector.track(req, res);
			})
			.fail(function(err) {
				console.log('10. ' + err.message);
				test.strictEqual(err.status, 401);
				test.strictEqual(res.status(), 401);
			})
			.then(function() {
				console.log('11. Sending taces with authentication');
				req.headers.authorization = gamePlayToken;
				return collector.track(req, res);
			})
			.then(function(value) {
				test.ok(value, 'Traces not added');
				test.strictEqual(204, res.status());
				return db.logictraces().count();
			})
			.then(function(count) {
				test.strictEqual(1, count, 'Wrong number of traces');
				return db.logictraces().findOne();
			})
			.then(function(trace) {
				test.strictEqual(trace.event, 'test');
				test.notEqual(trace.gamePlay, null, 'Game play is null in trace');
			})
			.then(function() {
				console.log('All tests done.');
				test.done();
			})
			.fail(function(err) {
				if (err) console.log('Error: ' + err.stack);
				test.ok(false);
				test.done();
			});
	}
};