var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var MAX_AGE = 60 * 60 * 24 * 7;
var JWT_SECRET = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'keyboardcats123';
var ALGORITHM = "HS256";
var AUDIENCE = 'teachinglean.org';

var localStrategyConfig = {
	usernameField: 'username',
	passwordField: 'password'
};

var jwtStrategyConfig = {
	secretOrKey: JWT_SECRET,
	audience: AUDIENCE,
	jwtFromRequest: function(req) {
		if (!req) return null;

		var token = null;

		if (req.cookies) {
			token = req.cookies['XSRF-TOKEN'];
		}
		
		if (!token && req.param) {
			token = req.param('XSRF-TOKEN');
		}
		
		if(!token) {
			token = req.get('X-XSRF-TOKEN');
		}
		
		return token;
	}
};



var linkedinStrategyConfig = {
	clientID: process.env.LINKEDIN_CLIENT_ID,
	clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
	callbackURL: process.env.LINKEDIN_CALLBACK_URI ? process.env.LINKEDIN_CALLBACK_URI : 
	process.env.NODE_ENV === 'development' ? 'http://localhost:3000/auth/linkedin/callback' : 'https://api.teachinglean.org/auth/linkedin/callback',
	scope: ['r_emailaddress', 'r_basicprofile'],
	state: true
};

/**
*  @description :: Authentication handler for local strategy
*/
function onLocalAuth(username, password, next) {
	User.findOne({ email: username }).exec(function (err, user) {
		if (err) { return next(err); }

		if (!user) return next(null, false, {
			error: 'An account with ' + username + ' does not exist.',
		});

		if (!AuthService.comparePassword(password, user.password)) {
			return next(null, false, {
				error: 'incorrect password.'
			});
		}

		user.lastLogin = new Date();
		user.save(function(err) {
			if (err) sails.log.error(err);
		});
		return next(null, user);
	});
}

/**
*  @description :: Authentication handler for JWT strategy
*  @param {object} payload - json web token
*  @param {function} done - callback accepting arguments done(err, user, info)
*/
function onJwtAuth(payload, done) {
	User.findOne({ uuid: payload.user.uuid }).exec(function (err, user) {
		if (err) return done(err, false);
		if (!user) return done(new Error('user not found!'));
		return done(null, user);
	});
}

function onLinkedinAuth(accessToken, refreshToken, profile, done) {
	var json = profile._json;
	var query = {};
	query.linkedinId = json.id;
	query.email = json.emailAddress;
	query.firstname = json.firstName;
	query.lastname = json.lastName;
	query.pictureUrl = json.pictureUrl;
	query.bio = json.summary;

	User.findOne({ linkedinId: query.linkedinId }).exec(function (err, user) {
		if (err) return done(err, false);

		if (!user) {
			User.create(query).exec(function (err, user) {
				if (err) return done(err, false);
				return done(null, user);
			});
		} else {

			if (user.email != query.email) {user.email = query.email;}
			if (user.pictureUrl != query.pictureUrl) {user.pictureUrl = query.pictureUrl;}
			user.lastLogin = new Date();
			user.save(function(err) {
				if (err) sails.log.error(err);
			});

			return done(null, user);
		}
	});
}

passport.serializeUser(function(user, done) {
	return done(null, user.uuid);
});

passport.deserializeUser(function(uuid, done) {
	User.findOne({uuid: uuid}).exec(function(err, user) {
		if (err) { return done(err); }
		if (!user) { return done('user is undefined\n\tconfig/passport.js'); }
		return done(null, user);
	});
});

passport.use(new LocalStrategy(localStrategyConfig, onLocalAuth));
passport.use(new JwtStrategy(jwtStrategyConfig, onJwtAuth));
passport.use(new LinkedInStrategy(linkedinStrategyConfig, onLinkedinAuth));


module.exports.passport = {
	jwt: {
		maxAge: MAX_AGE,
		secret: JWT_SECRET,
		algorithm: ALGORITHM,
		audience: AUDIENCE
	}
};
