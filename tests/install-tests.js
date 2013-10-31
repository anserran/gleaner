var Q = require('q');
Q.longStackSupport = true;
var db;

module.exports = {
	testInstall: function(test) {
		test.expect(1);
		var config = {
			dbHost: 'localhost',
			dbPort: 27017,
			dbName: 'test'
		};

		var installConfig = {
			adminUser: 'test',
			adminPassword: 'test'
		};

		require('../libs/installer/installer')(config, installConfig)
			.then(function() {
				test.ok(true);
				test.done();
			})
			.fail(function(err) {
				test.ok(false, err.stack);
				test.done();
			});
	}
};