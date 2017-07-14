/**
 * canUpdateUser.js
 *
 * @module      :: Policy
 * @description :: Policy that allows a client to update a user if the client is the user or the client has administrative priviledges
 *
 */

var passport = require('passport');

module.exports = function (req, res, next) {
	var user = req.user;

	if (!user) {
		return res.status(403).json({ error: 'user not authorized', info: info });
	}
	
	// If the client is the user and they aren't updating their own role, continue - otherwise check that they are an admin
	if (user.uuid == req.param('id') && (user.role == req.param('role') || !req.param('role'))) {
		return next();
	}

	if (user.toJSON().isAdmin == true) {
		return next();
	}

	return res.status(403).json({ error: 'user not authorized'});
};
