var Q = require('q');
var crypto = require('crypto');
var configuration = require('./configuration');

// User constants
var USER_PREFIX = 'u:',
    USER_NAME = 'name',
    USER_PASSWORD = 'password',
    USER_ROLE = 'role';

module.exports = (function() {

    var redis = function(operationName) {
        var args = [this.redisClient];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return exec.apply(this, args);
    };

    var mongo = function(operationName) {
        var args = [this.mongoDb];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return exec.apply(this, args);
    };

    var exec = function(target, operationName) {
        var op = target[operationName];
        if (!op || !target) {
            return Q.fcall(function() {
                if (!target) {
                    throw new Error('Target object is undefined');
                } else {
                    throw new Error(operationName + ' not found in ' + target);
                }
            });
        }

        var deferred = Q.defer();

        // Prepare arguments
        var args = [];
        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        args.push(function(err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
        });
        op.apply(target, args);
        return deferred.promise;
    };

    var saltAndHash = function(password) {
        return crypto.createHash('md5').update(password + configuration.salt).digest('hex');
    };

    var nextId = function(idkey) {
        return redis.call(this, 'incr', idkey);
    };

    return {
        nextId: nextId,
        initialize: function() {
            // Initialize only once
            if (!this.redisClient && !this.mongoDb) {
                var that = this;
                var redis = require('./db/rediscli');
                var mongo = require('./db/mongocli');
                return redis.connect().then(function(result) {
                    if (result) {
                        that.redisClient = redis.client;
                        return mongo.connect();
                    } else {
                        return false;
                    }
                }).then(function(result) {
                    if (result) {
                        that.mongoDb = mongo.db;
                    }
                    return result;
                });
            }
        },
        close: function() {
            if (this.redisClient) {
                console.log('Closing redis...');
                this.redisClient.quit();
                this.redisClient = null;
            }
            if (this.mongoDb) {
                console.log('Closing mongo...');
                this.mongoDb.close();
                this.mongoDb = null;
            }
        },
        flush: function() {
            if (this.redisClient) {
                return redis.call(this, 'flushdb');
            } else {
                return Q.fcall(function() {
                    return true;
                });
            }
        },
        /* Users operations */

        /** Adding a new user. Returns true if everything is ok **/
        addUser: function(user, password, role) {
            var that = this;
            return redis.call(this, 'exists', USER_PREFIX + user).then(function(result) {
                if (result) {
                    // User exists
                    throw new Error('User with name ' + user + ' already exists.');
                } else {
                    // Create user
                    return redis.call(that, 'hmset', USER_PREFIX + user, USER_PASSWORD, saltAndHash(password), USER_ROLE, role)
                        .then(function() {
                            return true;
                        });
                }
            });
        },
        /** Authenticate user. Returns her role **/
        authenticate: function(user, password) {
            var that = this;
            return redis.call(this, 'hget', USER_PREFIX + user, USER_PASSWORD)
                .then(function(result) {
                    if (result && result === saltAndHash(password)) {
                        return redis.call(that, 'hget', USER_PREFIX + user, USER_ROLE);
                    } else {
                        throw new Error('Invalid user or password');
                    }
                });
        },
        // CONSTANTS
        ROLE_ADMIN: 'admin'
    };

})();