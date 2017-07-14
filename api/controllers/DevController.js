/**
 * DevController
 *
 * @description :: Server-side logic for managing devs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('lodash');
var uuidV4 = require('node-uuid').v4;

module.exports = {
	test: function(req, res) {
		if (sails.config.environment != 'development') {
			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			sails.log.warn(`DevController route access attempted outside of development environment.\n\tfrom ${ip}\n\t${AppService.getTimestamp()}`)
			return res.status(403).json({data: `This action is only available in a development environment.`});
		}
		
		return res.json({
			data: 'testing dev environment'
		});
	},

	/**
	 * @desc :: Handler for `/dev/randUsers`, generates random users.
	 * @var {number} req.param('limit') :: max number of users to return.
	 * @var {number} req.param('skip') :: number of users to skip over; the 'starting' index.
	 * @var {number} req.param('size') :: number of randomly generated users up to a maximum of 301. Defaults to 50 if value not provided. 
	 */
	randomUsers: function(req, res) {
		var limit = +req.param('limit') || 300;
		if (limit > 300) { limit = 300 };

		var skip = +req.param('skip') || 0;
		if (skip > 299) { skip = 300 - limit; }
	
		size = +req.param('size') || 50;
		if (size > 299) { size = 300; }
		

		var users = [];
		var randNames = DevService.randNames;
		
		for (var i = skip; i < size && limit > 0; i++) {
			limit--;
			users.push({
				"uuid": uuidV4(),
				"lastname": randNames[i].lastname,
				"firstname": randNames[i].firstname,
				"password": "$2a$10$Qam10gzSoP9kEKRSW6oqOef1fR3rw/KvL6s.kWwCMDmgavLX.0y4i", // password is 'password'
				"email": `${randNames[i].firstname}.${randNames[i].lastname}@superfakemail.com`.toLowerCase(),
				"pictureUrl": "/assets/images/silhouette_vzugec.png",
				"role": "member",
				"accountIsActive": true,
				"lastLogin": new Date(),
				"createdAt": new Date()
			});
		}

		return res.json({
			size: users.length,
			authUser: req.user.toJSON(),
			users: users
		});
	},

	stats: function(req, res) {
		return res.json({
			size: 300
		});
	}

};

