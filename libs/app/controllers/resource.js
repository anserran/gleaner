module.exports = function(collection) {
	var ObjectID = require('mongodb').ObjectID;
	var validator = require('../validator');
	var Q = require('q');
	var HttpError = require('../httperror');

	this.collection = collection;

	/**
	 * List all objects in the collection matching the given query
	 */
	this.list = function(query, sort, limit, skip) {
		var that = this;
		return collection.find(query, this.projection, {
			limit: limit,
			sort: sort,
			skip: skip
		});
	};

	/**
	 * Returns the object designated by the given id
	 * @param  {String}   id       The object id
	 */
	this.getObjectById = function(id) {
		return collection.findOne({
			_id: id
		}, this.projection);
	};

	/**
	 * Adds an object to the collection
	 * @param  {Object}   object   the object to add
	 * @param  {Function} callback Callback tacking an error and the generated object
	 */
	this.add = function(object) {
		console.log('Adding ' + JSON.stringify(object));
		if (validator(object, this.rules)) {
			return this.processObject(object)
				.then(function(procesedObject) {
					return collection.insert(procesedObject).then(function(documents) {
						return documents[0];
					});
				});
		} else {
			return Q.fcall(function() {
				throw new HttpError('Invalid object', 400);
			});
		}
	};

	/**
	 * Removes an object from the collection
	 * @param  {String}   id       the object id
	 */
	this.removeById = function(id) {
		return this.remove({
			_id: id
		});
	};

	/**
	 * Remove all documents matching with the query
	 * @param  {Object}   query    Query
	 */
	this.remove = function(query) {
		console.log('Removing ' + JSON.stringify(query));
		return this.removeRelated(query).then(function() {
			return collection.remove(query);
		});
	};

	/**
	 * Finds one object matching the given query
	 * @param  {Object}   query    the query (in the mongodb format)
	 */
	this.findOne = function(query) {
		return collection.findOne(query, this.projection);
	};

	/**
	 * Updates the object designed by the given id with the fields contained in object
	 * @param  {Object}   id       Id of the object to be updated
	 * @param  {Object}   update   Update for the object
	 */
	this.update = function(id, update) {
		var that = this;
		return collection.update({
			_id: id
		}, {
			$set: update
		}).then(function() {
			return that.getObjectById(id);
		});
	};


	/**
	 * Counts the element matching the query
	 * @param  {Object} query the object with the query
	 */
	this.count = function(query) {
		return collection.count(query);
	};

	// The following functions must be OVERRIDEN by implementing classes (if necessary)

	/**
	 * Process the object before being added to the list. In this method,
	 * some fields of the object could change (e.g. a user password is hashed),
	 * and some checks are performed (e.g. check that some id refers to an existing object)
	 * @param  {Object}   object   the object to be processed
	 */
	this.processObject = function(object) {
		return Q.fcall(function() {
			return object;
		});
	};

	/**
	 * Removes objects related with the one represented by the given id
	 * @param  {Object}   query    the query for the main collection
	 */
	this.removeRelated = function(query) {
		return Q.fcall(function() {
			return true;
		});
	};
};