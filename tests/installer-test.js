var configuration = require('../libs/configuration');

var installer = require('../libs/installer');
var model = require('../libs/model');

exports.tearDown = function(callback) {
    console.log('Tear down');
    if (model.redisClient) {
        model.flush().then(function(err) {
            model.close();
            callback();
        });
    } else {
        callback();
    }
};

exports.testInstall = function(test) {
    test.expect(1);
    configuration.setConfigFile('tests/testconfig.json');

    var config = {
        adminUser: 'user',
        adminPassword: 'user'
    };

    for (var key in configuration) {
        config[key] = configuration[key];
    }

    installer.install(config).then(function(result) {
        test.ok(result, 'Not installed');
    }).fail(function(err) {
        test.ok(false, err.stack);
    }).then(function() {
        test.done();
    });
};

exports.testInstallFails = function(test) {
    test.expect(1);
    installer.install({})
        .fail(function(err) {
            test.ok(true);
        }).then(function() {
            test.done();
        });
};

exports.testWrongDB = function(test) {
    test.expect(1);
    configuration.setConfigFile('tests/testconfig.json');

    var config = {
        adminUser: 'user',
        adminPassword: 'user'
    };

    for (var key in configuration) {
        config[key] = configuration[key];
    }

    config.redisPort = 10000;

    installer.install(config).then(function(result) {
        test.ok(false, 'It should not install');
    }).fail(function(err) {
        console.log(err.message);
        test.ok(true);
    }).then(function() {
        test.done();
    });
};