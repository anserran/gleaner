module.exports = function(config, cb) {
	var express = require('express');
	var app = express();

	app.db = new require('../db/db')(config);

	// Configure express
	app.use(express.cookieParser());
	app.use(express.session({
		secret: config.salt
	}));
	console.log('Use body parser');
	app.use(express.bodyParser());

	// This configuration option is only intended por tests
	// It automatically logs in all request
	if ( config.testLogin ){
		app.all('*', function(req, res, next){
			req.session.user = 'testUser';
			req.session.role = config.testLogin;
			next();
		});
	}

	app.db.connect().then(function() {
		// Configure collector
		require('../collector/configure')(app, app.db, config);
		// Configure api
		require('./api')(app, config);
		// Configure frontend
		require('../frontend/configure')(app,config);

		app.use(function(err, req, res, next){
			console.log(err.stack);
			res.send(500);
		});
		cb(null, app);
	}).fail(function(err) {
		cb(err);
	});
};