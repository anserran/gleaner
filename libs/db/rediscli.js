/** Redis database client **/
module.exports = (function() {
    return {
        connect: function() {
            var Q = require('q');
            var deferred = Q.defer();

            var config = require('../configuration');
            var redis = require('redis');

            var client = redis.createClient(config.redisPort, config.redisHost);

            client.on('connect', function() {
                client.select(config.dbIndex, function(err) {
                    deferred.resolve(err ? false : true);
                });
            });

            client.on('error', function() {
                deferred.resolve(false);
            });

            this.client = client;

            return deferred.promise;
        }
    };
})();