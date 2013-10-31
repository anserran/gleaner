console.log('Starting gleaner...');
var config = require('../configs/config');

require('../libs/app/app')(config, function( err, app ){
	console.log('Starting server...');
	if ( err ) console.log(err.stack);
	app.listen(config.port, function() {
		console.log('Server listening in localhost:' + config.port);
	});
});
