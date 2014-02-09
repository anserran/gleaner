/** API **/
var dbutils = require('../../libs/db/dbutils');

/* Checks mongodb configuration */
exports.checkmongo = function(req, res) {
    // Check mongodb configuration
    var mongoHost = req.body.mongoHost;
    var mongoPort = req.body.mongoPort;
    var dbName = req.body.dbName;
    dbutils.checkMongoConnection(mongoHost, mongoPort, dbName)
        .then(function(result) {
            res.send(result);
        }).fail(function(err) {
            res.send(false);
        });
};

/* Checks redis configuration */
exports.checkredis = function(req, res) {
    // Check redis configuration
    var redisHost = req.body.redisHost;
    var redisPort = req.body.redisPort;
    var dbIndex = req.body.dbIndex;
    dbutils.checkRedisConnection(redisHost, redisPort, dbIndex)
        .then(function(result) {
            res.send(result);
        }).fail(function(err) {
            res.send(false);
        });
};

exports.install = function(req, res) {
    var installer = require('../../libs/installer');
    installer.install(req.body)
        .then(function(result) {
            res.send(result);
        }).fail(function(err) {
            console.log(err.stack);
            res.send(false);
        });
};