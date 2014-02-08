var JobsQueues = require('../libs/jobsqueues/jobsqueues.js');
var queues;

exports.setUp = function( callback ){
	console.log('Creating queues');
	queues = new JobsQueues(null, null, function(err){
		if ( err ){
			throw err;
		}
		console.log('Connected');
		callback();
	});
};

exports.tearDown = function(callback){
	console.log('Closing queues');
	queues.end();
	callback();
};

exports.testGetQueues = function(test){
	test.expect(1);
	console.log('Adding queues...');
	queues.addQueue('q1');
	queues.addQueue('q2');
	test.equal(queues.queues.length, 2);
	test.done();
};

exports.testAddJob = function(test){
	test.expect(1);
	queues.addQueue('q1');
	queues.addJob('q1', 'j1', function(err){
		queues.nextJob('q1', function(err, jobIdentifier){
			test.equal(jobIdentifier, 'j1');
			test.done();
		});
	});
};

exports.testSize = function(test){
	queues.addQueue('q1');
	queues.addJob('q1', 'j1', function(err){
		queues.size('q1', function(err, result){
			test.equal(result, 1);
			test.done();
		});
	});
};