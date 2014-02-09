/* Some utils function to check databases */

var Q = require('q');

/* Checks if there is a valid mongo connection with the given parameters. Returns a promise */
exports.checkMongoConnection = function(host, port, dbName) {
    var deferred = Q.defer();
    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect('mongodb://' + host + ':' + port + '/' + dbName, function(err, db) {
        if (err) {
            deferred.reject(new Error('Error connecting to mongo'));
        } else {
            db.close();
            deferred.resolve(true);
        }
    });
    return deferred.promise;
};

/* Checks if there is a valid redis connection with the given parameters. Returns a promise. */
exports.checkRedisConnection = function(host, port, dbIndex) {
    var deferred = Q.defer();
    var redis = require('redis');
    var client = redis.createClient(port, host);
    client.on('connect', function() {
        client.select(dbIndex, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(true);
            }
            client.end();
        });
    });
    client.on('error', function() {
        deferred.reject(new Error('Error connecting to redis'));
        client.end();
    });
    return deferred.promise;
};