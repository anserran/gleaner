
module.exports = function(app, config){
	var express = require('express');

	var pub = __dirname + '/../../public';
	app.use(express.static(pub));
	// Enable html rendering
	app.set('views', pub);
	app.engine('html', require('ejs').renderFile);

	app.get('/', function(req, res){
		if (!req.session.user){
			res.redirect('/login');
		} else {
			res.send('Hello world.');
		}
	});

	app.get('/login', function(req, res){
		res.render('login.html');
	});
};