try {
	require.resolve('../configs/config');
} catch (e) {
	throw new Error('config.js not found. You need to create a proper config.js ' +
		'file in the configs/ folder to install gleaner. Check configs/config.js.sample to see the required ' +
		'properties.');
}

try {
	require.resolve('../configs/installconfig');
} catch (e) {
	throw new Error('installconfig.js not found. You need to create a proper installconfig.js ' +
		'file in the configs/ folder to install gleaner. Check installconfig.js.sample to see the required ' +
		'properties.');
}


// Script start
var config = require('../configs/config');
var installConfig = require('../configs/installconfig');

require('../libs/installer/installer')(config, installConfig)
	.then(function() {
		console.log(i18n.__('Gleaner was successfully installed!'));
	}).fail(function(err) {
		console.log(i18n.__('Something went wrong installing Gleaner'));
		console.log(err.stack);
	});