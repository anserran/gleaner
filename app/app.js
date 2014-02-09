/**
 * Module dependencies
 */
var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api'),
    path = require('path');

var app = module.exports = express();


/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
    // TODO
}


/**
 * Routes
 */
app.get('/install', routes.install);
app.post('/api/install', api.install);
app.post('/api/checkmongo', api.checkmongo);
app.post('/api/checkredis', api.checkredis);