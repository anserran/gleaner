var fs = require('fs');
var configuration = {
    configFile: 'configs/config.json'
};

configuration.setConfigFile = function(path) {
    this.configFile = path;
    this.load();
};

configuration.load = function() {
    if (fs.existsSync(this.configFile)) {
        var data = fs.readFileSync(this.configFile);
        var conf = JSON.parse(data);
        for (var key in conf) {
            this[key] = conf[key];
        }
    }
};

configuration.save = function(configuration) {
    var data = JSON.stringify(configuration);
    fs.writeFileSync(this.configFile, data);
    this.load();
};

module.exports = configuration;