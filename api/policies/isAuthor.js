/**
 * isAuthor.js
 *
 * @module      :: Policy
 * @description :: Policy that authenticates users that have "editor" or admin level priviledges
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

var passport = require('passport');

module.exports = function(req, res, next) {
	passport.authenticate('jwt', function(err, user, info) {
		if (err) {
			return res.status(500).json({ error: err, info: info, user: null });
		}
		if (!user) {
			return res.status(403).json({ error: 'user not authorized', info: info });
		}

		if (user.role != 'systemAdmin' || user.role != 'admin' || user.role != 'author') {
			return res.status(403).json({ error: 'user not authorized', info: info });
		}

		req.user = user;

		return next();
	})(req, res);

};
