var config = require('./testconfig');
var dbutils = require('../libs/db/dbutils');

exports.testCheckMongoConnection = function(test) {
    test.expect(2);
    dbutils.checkMongoConnection(config.mongoHost, config.mongoPort, config.dbName).then(function(result) {
        test.ok(result, 'No connection to mongodb');
        return dbutils.checkMongoConnection('onehost', 3272, 'invalid');
    }).then(function(result) {
        test.ok(false, 'It should not connect');
    }).fail(function(err) {
        test.ok(true);
    }).then(function() {
        test.done();
    });
};

exports.testCheckRedisConnection = function(test) {
    test.expect(2);
    dbutils.checkRedisConnection(config.redisHost, config.redistPort, config.dbIndex)
        .then(function(result) {
            test.ok(result, 'No connection to redis');
            return dbutils.checkRedisConnection(config.redisHost, config.redistPort, 1000);
        }).then(function(result) {
            test.ok(false, 'It should not connect');
        }).fail(function(err) {
            test.ok(true);
        }).then(function() {
            test.done();
        });
};

exports.testBadRedisConnection = function(test) {
    test.expect(1);
    dbutils.checkRedisConnection(config.redisHost, 10, config.dbIndex)
        .then(function(result) {
            test.ok(false, 'It should not connect');
        }).fail(function(err) {
            test.ok(true);
        }).then(function() {
            test.done();
        });
};