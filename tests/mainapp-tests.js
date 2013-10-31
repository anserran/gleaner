var request = require('supertest');
var config = require('./testconfig');
config.testLogin = 'admin';
var getApp = require('../libs/app/app');
var app;
var server;
var newId;
var Q = require('q');
Q.longStackSupport = true;

module.exports = {
	setUp: function(cb) {
		getApp(config, function(err, application) {
			console.log('Setting up test.');
			if (err) console.log(err.stack);
			app = application;
			server = app.listen(config.port);
			console.log('Testing...');
			cb();
		});
	},
	tearDown: function(cb) {
		console.log('Tear down test...');
		app.db.disconnect().done(function() {
			server.close();
			console.log('Server and database closed');
			cb();
		});
	},
	testPostGame: function(test) {
		app.db.games().remove()
			.then(function() {
				return app.db.gameinstances().remove();
			})
			.then(function() {
				return app.db.activegameplays().remove();
			})
			.then(function() {
				return app.db.gameplays().remove();
			})
			.then(function() {
				return app.db.logictraces().remove();
			})
			.then(function() {
				request(server)
					.post('/api/games')
					.send({
						title: 'New game'
					})
					.expect(200)
					.end(function(err, res) {
						if (err) console.log(err.stack);
						test.strictEqual(200, res.status);
						test.notEqual(res.body, null);
						test.notEqual(res.body._id, null);
						test.strictEqual(res.body.title, 'New game');
						newId = res.body._id;
						console.log('Id received: ' + JSON.stringify(newId));
						app.db.games().count().then(function(count) {
							test.strictEqual(count, 1);
							test.done();
						}).fail(function(err) {
							console.log(err.stack);
							test.done();
						});
					});
			}).fail(function(err) {
				console.log(err.stack);
				test.done();
			});
	},
	testGetGames: function(test) {
		test.expect(2);
		request(server)
			.get('/api/games')
			.expect(200)
			.end(function(err, res) {
				if (err) console.log(err.stack);
				console.log('Response:' + JSON.stringify(res.body));
				test.notEqual(res.body, null);
				test.strictEqual(res.body.length, 1);
				test.done();
			});
	},
	testPutGame: function(test) {
		request(server)
			.put('/api/games/' + newId)
			.send({
				title: 'New title'
			})
			.expect(200)
			.end(function(err, res) {
				if (err) console.log(err.stack);
				console.log('Response: ' + JSON.stringify(res.body));
				test.notEqual(res.body, null);
				test.strictEqual(res.body._id, newId);
				test.strictEqual(res.body.title, 'New title');
				app.db.games().findOne().then(function(game) {
					test.strictEqual(game._id.toString(), newId);
					test.strictEqual(game.title, 'New title');
					test.done();
				});
			});
	},
	testPostInvalidGameInstance: function(test) {
		request(server)
			.post('/api/gameinstances/')
			.send({
				game: 0,
				title: 'Test Game Instance',
				token: '000',
				enabled: true
			}).expect(400)
			.end(function(err, res) {
				if (err) console.log(err.stack);
				test.strictEqual(res.status, 400);
				test.done();
			});
	},
	testPostGameInstance: function(test) {
		request(server)
			.post('/api/gameinstances/')
			.send({
				game: newId,
				name: 'Test Game Instance',
				token: '000000',
				enabled: true
			}).expect(200)
			.end(function(err, res) {
				if (err) console.log(err.stack);
				test.notEqual(res.body, null);
				test.notEqual(res.body._id, null);
				test.strictEqual(res.body.name, 'Test Game Instance');
				test.strictEqual(res.body.token, '000000');
				test.ok(res.body.enabled);
				test.done();
			});
	},
	testApp: function(test) {
		test.expect(6);
		request(server).get('/c/start/000000')
			.expect(200)
			.end(function(err, res) {
				if (err) console.log(err.stack);
				test.notEqual(res.body, null);
				test.notEqual(res.body.gamePlayToken, null);
				test.strictEqual(res.status, 200);
				request(server)
					.post('/c/track/')
					.send([{
						type: 'logic',
						event: 'test_collector',
						target: 'ok'
					}])
					.set('Authorization', res.body.gamePlayToken)
					.expect(204)
					.end(function(err, res) {
						if (err) console.log(err.stack);
						test.strictEqual(res.status, 204);
						app.db.logictraces().findOne({
							event: 'test_collector'
						}).then(function(trace) {
							console.log('Traces sent');
							test.notEqual(trace, null);
							test.strictEqual(trace.target, 'ok');
						}).fail(function(err) {
							test.ok(false, err.stack);
						}).fin(function() {
							test.done();
						});
					});
			});
	},
	testDeleteGame: function(test) {
		test.expect(6);
		request(server)
			.del('/api/games/' + newId)
			.expect(204)
			.end(function(err, res) {
				if (err) console.log(err.stack);
				test.strictEqual(res.status, 204);
				app.db.games().count().then(function(count) {
					test.strictEqual(0, count);
				}).then(function() {
					return app.db.gameinstances().count().then(function(count) {
						test.strictEqual(0, count);
					});
				}).then(function() {
					return app.db.gameplays().count().then(function(count) {
						test.strictEqual(0, count);
					});
				}).then(function() {
					return app.db.activegameplays().count().then(function(count) {
						test.strictEqual(0, count);
					});
				}).then(function() {
					return app.db.logictraces().count().then(function(count) {
						test.strictEqual(0, count);
						test.done();
					});
				});
			});
	}
};

/*module.exports.setUp(function() {
	module.exports.testPostGame({
		strictEqual: function() {},
		notEqual: function() {},
		ok: function() {},
		expect: function() {},
		done: function(){
			module.exports.tearDown(function(){});
		}
	});
});*/