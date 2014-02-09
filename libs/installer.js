module.exports = (function() {
    return {
        install: function(config) {
            var err;
            // Check mongodb configuration
            var mongoHost = config.mongoHost;
            var mongoPort = config.mongoPort;
            var dbName = config.dbName;

            var promise;

            if (!mongoHost && !mongoPort && !dbName) {
                err = new Error('Missing mongo parameters');
            }

            // Check redis configuration
            var redisHost = config.redisHost;
            var redisPort = config.redisPort;
            var dbIndex = config.dbIndex;

            if (!redisHost || !redisPort || !dbIndex) {
                err = new Error('Missing redis parameters');
            }

            // Check user and password
            var user = config.adminUser;
            var password = config.adminPassword;
            var salt = config.salt;

            if (!user || !password || !salt) {
                err = new Error('Missing user parameters');
            }

            if (err) {
                var Q = require('q');
                return Q.fcall(function() {
                    throw err;
                });
            }

            var dbutils = require('./db/dbutils');
            // Check mongo connection
            return dbutils.checkMongoConnection(mongoHost, mongoPort, dbName)
                .then(function(result) {
                    if (result) {
                        // Check reddis connection
                        return dbutils.checkRedisConnection(redisHost, redisPort, dbIndex);
                    } else {
                        throw new Error('Invalid mongodb connection parameters');
                    }
                }).then(function(result) {
                    if (result) {
                        // Write config
                        var config = {
                            salt: salt,
                            mongoHost: mongoHost,
                            mongoPort: mongoPort,
                            dbName: dbName,
                            redisHost: redisHost,
                            redisPort: redisPort,
                            dbIndex: dbIndex
                        };
                        var configuration = require('../libs/configuration');
                        configuration.save(config);

                        var model = require('./model');
                        return model.initialize().then(function() {
                            return model.addUser(user, password, model.ROLE_ADMIN);
                        });
                    } else {
                        throw new Error('Invalid redis connection parameters');
                    }
                });
        }
    };
})();