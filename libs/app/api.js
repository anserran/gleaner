module.exports = function(app, config) {
	var Q = require('q');
	var ObjectID = require('mongodb').ObjectID;
	var resources = require('./resources')(app.db, config);
	var roles = ['player', 'teacher', 'admin'];
	var permissions = require('./permissions');
	var HttpError = require('./httperror');

	function handleRequest(req, res, operation) {
		var user = req.session.user;
		var role = req.session.role;
		var type = req.params.resource;
		var id;
		console.log(operation + ' ' + type);
		// id (if exists) is always a string. Need to convert to ObjectID
		try {
			// ObjectID throws an exception if it's not a valid id
			id = req.params.id ? new ObjectID(req.params.id) : null;
		} catch (err) {
			res.send(400);
			return;
		}
		req.body = req.body || {};
		console.log('Request id: ' + id);
		console.log('Request body:' + JSON.stringify(req.body));
		checkPermission(user, role, type, id)
			.then(function() {
				console.log('Permission granted');
				switch (operation) {
					case 'read':
						return id ? resources.getObjectById(type, id) : resources.list(type, req.body.query, req.body.sort, req.body.limit, req.body.skip);
					case 'create':
						console.log('Creating ' + type);
						return resources.add(type, req.body);
					case 'delete':
						console.log('Deleting ' + type);
						return resources.removeById(type, id);
					case 'update':
						return resources.update(type, id, req.body);
					default:
						throw new HttpError('Invalid operation type: ' + operation, 500);
				}
			}).then(function(result) {
				console.log("Result:" + JSON.stringify(result));
				console.log("Id:" + result._id);
				if (operation == 'delete') {
					res.send(204);
				} else {
					res.status(200);
					res.send(result);
				}
			}).fail(function(err) {
				if (err) console.log(err.stack);
				res.send(err && err.status ? err.status : 500);
			});
	}

	function checkPermission(user, role, resource, id) {
		var deferred = Q.defer();
		if (role === 'player' && resource == 'gameinstances') {
			deferred.resolve(true);
		} else if ( role === 'admin' || role == 'teacher'){
			deferred.resolve(true);
		} else {
			deferred.reject(new HttpError('No permission to access this resource', 403));
		}
		return deferred.promise;
	}

	app.get('/api/:resource', function(req, res) {
		handleRequest(req, res, 'read');
	});

	app.get('/api/:resource/:id', function(req, res) {
		handleRequest(req, res, 'read');
	});

	app.post('/api/:resource', function(req, res) {
		handleRequest(req, res, 'create');
	});

	app.delete('/api/:resource/:id', function(req, res) {
		handleRequest(req, res, 'delete');
	});

	app.put('/api/:resource/:id', function(req, res) {
		handleRequest(req, res, 'update');
	});
};