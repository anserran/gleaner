var configuration = require('../libs/configuration');
configuration.setConfigFile('tests/testconfig.json');

var model = require('../libs/model');

exports.setUp = function(callback) {
    model.initialize().then(function(result) {
        console.log('Initialization done');
    }).fail(function(err) {
        console.log('Error', err.stack);
    }).then(function() {
        console.log('Set up done');
        callback();
    });
};

exports.tearDown = function(callback) {
    console.log('Closing...');
    model.flush().then(function() {
        model.close();
        callback();
    });
};

exports.testNextId = function(test) {
    console.log('Testing next id');
    test.expect(1);
    model.nextId('test')
        .then(function(result) {
            console.log('Result ' + result);
            test.ok(result > -1, "Invalid identifier");
        }).fail(function(err) {
            console.log('Error ' + err.stack);
            test.ok(false, err.stack);
        }).then(function() {
            console.log('Done');
            test.done();
        });
};

exports.testAddUser = function(test) {
    model.addUser('user', 'testpassword', 'admin')
        .then(function(result) {
            test.ok(result, 'User not created');
        }).fail(function(err) {
            test.ok(false, err.stack);
        }).then(function() {
            test.done();
        });
};

exports.testAddDuplicateUser = function(test) {
    test.expect(1);
    model.addUser('user', 'testpassword', 'admin')
        .then(function(result) {
            return model.addUser('user', 'user', 'admin');
        }).then(function() {
            test.ok(false, 'User should not be created');
        }).fail(function(err) {
            test.ok(true);
        }).then(function() {
            test.done();
        });
};

exports.testAuthenitcate = function(test) {
    test.expect(1);
    model.addUser('user', 'testpassword', 'admin')
        .then(function() {
            return model.authenticate('user', 'testpassword');
        }).then(function(role) {
            test.equal(role, 'admin');
        }).fail(function(err) {
            test.ok(false, err.stack);
        }).then(function() {
            test.done();
        });
};

exports.testFailAuthenitcate = function(test) {
    test.expect(1);
    model.addUser('user', 'testpassword', 'admin')
        .then(function() {
            return model.authenticate('user', 'testpa3ssword');
        }).fail(function(err) {
            test.ok(true);
        }).then(function() {
            test.done();
        });
};