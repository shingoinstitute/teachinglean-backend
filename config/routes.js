/**
* Route Mappings
* (sails.config.routes)
*
* Your routes map URLs to views and controllers.
*
* If Sails receives a URL that doesn't match any of the routes below,
* it will check for matching files (images, scripts, stylesheets, etc.)
* in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
* might match an image file: `/assets/images/foo.jpg`
*
* Finally, if those don't match either, the default 404 handler is triggered.
* See `api/responses/notFound.js` to adjust your app's 404 logic.
*
* Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
* flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
* CoffeeScript for the front-end.
*
* For more information on configuring custom routes, check out:
* http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
*/

module.exports.routes = {
	
	// enable all "cors". CSRF protection is taken care of by the NGINX config on the production server.
	// Allowing CORS on all routes removes unnecessary headaches while proxying requests
	// on the production server.
	'/*': {
		cors: true
	},

	// +-------------+
	// | auth routes |
	// +-------------+
	'/auth/linkedin': 'AuthController.linkedInAuth',
	'/auth/linkedin/callback': 'AuthController.linkedInAuthCallback',
	'/auth/local': 'AuthController.localAuth',
	'/auth/logout': 'AuthController.logout',
	'/verifyEmail/:id': 'AuthController.verifyEmail',
	
	// +--------------+
	// | entry routes |
	// +--------------+
	'put /entry/upvote/:id': 'EntryController.upvote',
	'put /entry/downvote/:id': 'EntryController.downvote',
	'get /entry/topResults': 'EntryController.topResults',
	
	// +-------------+
	// | user routes |
	// +-------------+
	'get /me': 'UserController.me',
	'get /stats': 'UserController.stats',
	'get /user/portrait': 'UserController.getPortrait',
	'post /user/photoUpload': 'UserController.photoUpload',
	'get /users': 'UserController.find',
	'post /reset': 'UserController.sendPasswordResetEmail',
	'get /emailDoesExist': 'UserController.emailDoesExist',
	'get /usernameDoesExist': 'UserController.usernameDoesExist',
	'put /reset/:id': 'UserController.updatePassword',
	'get /reset/:id': {
		layout: 'layout',
		controller: 'UserController',
		action: 'reset'
	},
	'get /reset': {
		view: 'layout'
	},

	// +-------------+
	// | dev routes |
	// +-------------+
	'get /user/randUsers': 'DevController.randomUsers',
	'get /dev/user/stats': 'DevController.stats'
	
};
