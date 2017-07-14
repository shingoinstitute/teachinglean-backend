/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

var passport = require('passport');
var jwt = require('jsonwebtoken');

const options = {
	audience: sails.config.passport.jwt.audience,
	algorithm: sails.config.passport.jwt.algorithm,
}

const jwtSecret = sails.config.passport.jwt.secret;

module.exports = function(req, res, next) {

	passport.authenticate('jwt', function(err, user, info) {
		if (err) {
			var errMsg = err.message ? err.message : err;
        if (errMsg.toString) errMsg = errMsg.toString();

        sails.log.error(errMsg);

        if (errMsg.includes('user not found')) {
			  return res.status(404).json({error: errMsg});
		  }

        return res.status(500).json({ error: err, info: info, user: null });
		}

		if (!user) {
			return res.status(403).json({ error: 'user not authorized', info: info });
		}

		req.user = user;

		return next();
	})(req, res);

};
