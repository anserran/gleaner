var Q = require('q');
var db;

var Collection = function(name) {
	this.name = name;
	this.collection = db.collection(name);
};

Collection.prototype.insert = function(documents) {
	var deferred = Q.defer();
	this.collection.insert(documents, {
		safe: true
	}, function(err, result) {
		if (err) {
			deferred.reject(err);
		} else {
			console.log('Inserted ' + JSON.stringify(result));
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

Collection.prototype.remove = function(documents) {
	var deferred = Q.defer();
	var that = this;
	this.collection.remove(documents, function(err, result) {
		if (err) {
			deferred.reject(err);
		} else {
			console.log(that.name + ' removed ' + result);
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

Collection.prototype.findOne = function(query, projection) {
	var deferred = Q.defer();
	this.collection.findOne(query, projection || {}, function(err, document) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(document);
		}
	});
	return deferred.promise;
};

Collection.prototype.find = function(query, projection, options) {
	var deferred = Q.defer();
	var cursor = this.collection.find(query || {});
	cursor = options.sort ? cursor.sort(options.sort) : cursor;
	cursor = options.limit ? cursor.limit(options.limit) : cursor;
	cursor = options.skip ? cursor.skip(options.skip) : cursor;
	cursor.toArray(function(err, results) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(results);
		}
	});
	return deferred.promise;
};


Collection.prototype.update = function(query, set) {
	console.log('Upating collection...');
	var deferred = Q.defer();
	this.collection.update(query, set, function(err, result) {
		if (err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log('Updated ' + result);
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

Collection.prototype.drop = function() {
	var deferred = Q.defer();
	var that = this;
	this.collection.drop(function(err, result) {
		if (err) {
			deferred.reject(err);
		} else {
			console.log(that.name + ' dropped');
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

Collection.prototype.count = function(query) {
	var deferred = Q.defer();
	var that = this;
	this.collection.count(query || {}, function(err, result) {
		if (err) {
			deferred.reject(err);
		} else {
			console.log(that.name + " count: " + result);
			deferred.resolve(result);
		}
	});
	return deferred.promise;
};

var DB = function(config) {
	var MongoClient = require('mongodb').MongoClient,
		Server = require('mongodb').Server;

	// Set up the connection to the local db
	var mongoclient = new MongoClient(new Server(config.dbHost, config.dbPort, {
		native_parser: true
	}));

	var collections = {};

	var connect = function() {
		var deferred = Q.defer();
		var dbName = config.dbName;
		console.log('Connecting to ' + dbName);
		if (db) {
			deferred.resolve(db);
		} else {
			mongoclient.open(function(err, mongoclient) {
				if (err) {
					console.log('Error connecting ' + err.message);
					deferred.reject(err);
				} else {
					db = mongoclient.db(dbName);
					console.log('Connected to ' + dbName);
					deferred.resolve(db);
				}
			});
		}
		return deferred.promise;
	};

	var disconnect = function() {
		var deferred = Q.defer();
		mongoclient.close(function(err, result) {
			if (err) {
				deferred.reject(err);
			} else {
				db = null;
				console.log('Disconnected');
				deferred.resolve(result);
			}
		});
		return deferred.promise;
	};

	var collection = function(name) {
		if (!collections[name]) {
			console.log('Collection created: ' + name);
			collections[name] = new Collection(name);
		}
		return collections[name];
	};

	return {
		connect: connect,
		disconnect: disconnect,
		collection: collection,
		isConnected: function() {
			return db || false;
		},
		games: function() {
			return collection('games');
		},
		gameinstances: function() {
			return collection('gameinstances');
		},
		gameplays: function() {
			return collection('gameplays');
		},
		activegameplays: function() {
			return collection('activegameplays');
		},
		logictraces: function() {
			return collection('logictraces');
		},
		inputtraces: function() {
			return collection('inputtraces');
		},
		users: function() {
			return collection('users');
		}
	};
};

module.exports = DB;