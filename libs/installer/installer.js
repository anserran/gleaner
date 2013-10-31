module.exports = function(config, installConfig) {
	var db = new require('../db/db')(config);
	var crypto = require('crypto');

	return db.connect()
		.then(function() {
			return db.users().insert({
				name: installConfig.adminUser,
				password: crypto.createHash('md5').update(installConfig.adminPassword + config.salt).digest('hex'),
				role: 'admin'
			});
		}).then(function() {
			return db.disconnect();
		});
};