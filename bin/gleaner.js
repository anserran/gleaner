var app = require('../app/app');
var http = require('http');

/* Start server */
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});