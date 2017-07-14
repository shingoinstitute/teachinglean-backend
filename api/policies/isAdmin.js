/**
 * isAdmin.js
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
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

		if (!user.toJSON().isAdmin) {
			return res.status(403).json({ error: 'user not authorized', info: info });
		}

		req.user = user;

		return next();
	})(req, res);

};
