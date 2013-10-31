var HttpError = require('../app/httperror');

module.exports.ead = (function() {
	return {
		authenticate: function(req) {
			if (req.headers.authorization) {
				return req.headers.authorization;
			} else {
				throw new HttpError('', 401);
			}
		}
	};
})();

module.exports.ip = (function() {
	return {
		authenticate: function(req) {
			if (req.headers.authorization && req.headers.authorization !== "anonymous") {
				return req.headers.authorization;
			} else {
				var user = "user" + Math.round(Math.random() * 1000);
				var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
				if (ip) {
					return user + ":" + ip;
				} else {
					throw new HttpError('', 401);
				}
			}
		}
	};
})();

module.exports.user = (function() {
	return {
		authenticate: function(req) {
			// FIXME
			if (req.headers.authorization) {
				return req.headers.authorization;
			} else {
				throw new HttpError('', 401);
			}
		}
	};
})();

module.exports.nickname = (function() {
	return {
		authenticate: function(req) {
			if (req.headers.authorization) {
				var nickname = req.headers.authorization;
				var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
				return nickname + ":" + ip;
			} else {
				throw new HttpError('', 401);
			}
		}
	};
})();