/** Mongo database client **/
module.exports = (function() {
    return {
        connect: function() {
            var Q = require('q');
            var MongoClient = require('mongodb').MongoClient;

            var deferred = Q.defer();

            var config = require('../configuration');
            var that = this;

            MongoClient.connect(
                'mongodb://' + config.mongoHost + ':' + config.mongoPort + '/' + config.dbName,
                function(err, db) {
                    if (err) {
                        deferred.resolve(false);
                    } else {
                        that.db = db;
                        deferred.resolve(true);
                    }
                });

            return deferred.promise;
        }
    };
})();