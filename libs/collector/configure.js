module.exports = function(app, db, config) {
	var collector = new require('./gleanerCollector')(config, db);

	app.get('/c/start/:gameInstanceToken', function(req, res) {
		collector.start(req, res);
	});

	app.post('/c/track', function(req, res) {
		collector.track(req, res);
	});
};