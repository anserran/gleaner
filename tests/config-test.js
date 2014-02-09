var configuration = require('../libs/configuration');
configuration.setConfigFile('tests/config.json');

exports.testSave = function(test) {
    var conf = {
        conf1: 'value1',
        conf2: 'value2'
    };
    configuration.save(conf);

    for (var key in conf) {
        test.equals(conf[key], configuration[key]);
    }
    test.done();
};