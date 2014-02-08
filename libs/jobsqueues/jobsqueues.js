

var JobsQueues = function(config, queues, callback){
	// Read config
	config = config || {};
	this.config = {
		port: config.port || 6379,
		host: config.host || "127.0.0.1",
		prefix: config.prefix || "jobsQueue:"
	};

	this.queues = queues || [];

	var redis = require('redis');
	this.client = redis.createClient(config.port, config.host);

	if (callback){
		this.client.on('connect', function(){
			callback();
		});

		this.client.on('error', function(err){
			callback(new Error('Impossible to connect to redis: ' + err.message ));
		});
	}
};

JobsQueues.prototype.addQueue = function(queueIdentifier) {
	this.queues.push(this.config.prefix + queueIdentifier);
};

JobsQueues.prototype.addJob = function(queueIdentifier, jobIdentifier, callback) {
	queueIdentifier = this.config.prefix + queueIdentifier;
	if ( this.queues.indexOf(queueIdentifier) == -1 ){
		callback(new Error("The queue doesn't exist"));
	} else {
		this.client.sadd(queueIdentifier, jobIdentifier, function( err, res ){
			callback(err);
		});
	}
};

JobsQueues.prototype.nextJob = function(queueIdentifier, callback) {
	this.client.spop(this.config.prefix + queueIdentifier, callback);
};

JobsQueues.prototype.end = function() {
	this.client.quit();
};

JobsQueues.prototype.size = function(queueIdentifier, callback) {
	this.client.scard(this.config.prefix + queueIdentifier, callback);
};

module.exports = JobsQueues;